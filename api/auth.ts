import { Router } from 'express'
import type { Request, Response } from 'express'
import {
  cryptr,
  JWT_SECRET,
  PELCRO_COOKIE,
  TOKEN_COOKIE
} from '../constants'
import jwt from 'jsonwebtoken'
import routeCache from 'route-cache'
import { loadUser } from '../helpers/pelcro'
import { v4 as uuidv4 } from 'uuid'
import { getPlayload } from '../helpers/playload'

const router = Router()

// cache permanent when not authorized
router.get('/user/:site/:app', routeCache.cacheSeconds(0, (req: Request, res: Response) => {
    const {
        params: { site }
    } = req
    if (req.cookies[PELCRO_COOKIE] || req.cookies[`${TOKEN_COOKIE}.${site}`]) { return null }
    return req.originalUrl
}), async (req: Request, res: Response) => {
  const {
    params: { site, app }
  } = req
  const pelcroToken = req.cookies[PELCRO_COOKIE]
  const tokenCookie = req.cookies[`${TOKEN_COOKIE}.${site}`]
  if (!pelcroToken) {
    // if user sign out. clear session cookie, and invalidate cache
      if (tokenCookie) {
        res.clearCookie(`${TOKEN_COOKIE}.${site}`)
        const id = cryptr.decrypt(tokenCookie).split(':').shift()
        routeCache.removeCache(`/auth/user/${site}/${app}/${id}`)
    }
    res.status(401).send('unauthorize')
    return
  }
  // if session cookie existed, redirect
  if (tokenCookie) {
    const id = cryptr.decrypt(tokenCookie).split(':').shift()
    res.redirect(301, `/auth/user/${site}/${app}/${id}`)
  } else {
    // otherwise, get user info to calculate redirect path.
    const userData = await loadUser(pelcroToken, site)
    if (!userData) {
      res.status(401).send('Unauthorized')
      return
    }
    const { id } = userData
    res.cookie(
        `${TOKEN_COOKIE}.${site}`,
        cryptr.encrypt(`${id}:${site}`),
        {
          httpOnly: true
        }
      )
    res.redirect(301, `/auth/user/${site}/${app}/${id}`);
  }
})

// cache actually jwt get request
router.get(
  '/user/:site/:app/:id',
  routeCache.cacheSeconds(24 * 60 * 60),
  async (req: Request, res: Response) => {
    const {
      params: { site, app }
    } = req
    const pelcroToken = req.cookies[PELCRO_COOKIE]
    const userData = await loadUser(pelcroToken, site)
    if (!userData) {
        res.status(500).send('something went wrong, try again'); 
    } else {
        const token = jwt.sign({ ...await getPlayload(userData, app), site }, JWT_SECRET, {
            expiresIn: '3d',
            jwtid: uuidv4()
        })
        res.status(200).send(token)
    }
  }
)

export default router
