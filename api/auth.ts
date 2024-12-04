import { Router } from 'express'
import type { Request, Response } from 'express'
import {
  cryptr,
  JWT_SECRET,
  PELCRO_COOKIE,
  redisClient,
  TOKEN_COOKIE
} from '../constants'
import jwt, { TokenExpiredError } from 'jsonwebtoken'
import routeCache from 'route-cache'
import { loadUser } from '../helpers/pelcro'
import { v4 as uuidv4 } from 'uuid'
import { getPlayload } from '../helpers/playload'

const router = Router()

router.get('/user/:site/:app', async (req: Request, res: Response) => {
  const {
    params: { site, app }
  } = req
  const pelcroToken = req.cookies[PELCRO_COOKIE]
  if (!pelcroToken) {
    res.clearCookie(`${TOKEN_COOKIE}.${site}`)
    res.status(401).send('unauthorize')
    return
  }
  const tokenCookie = req.cookies[`${TOKEN_COOKIE}.${site}`]
  if (tokenCookie) {
    console.log('decrypt:', cryptr.decrypt(tokenCookie));
    const id = cryptr.decrypt(tokenCookie).split(':').shift()
    console.log('id:', id)
    res.redirect(301, `/auth/user/${site}/${app}/${id}`)
  } else {
    const userData = await loadUser(pelcroToken, site)

    if (!userData) {
      res.status(401).send('Unauthorized')
      return
    }
    const token = jwt.sign({ ...await getPlayload(userData, app), site }, JWT_SECRET, {
      expiresIn: '1h',
      jwtid: uuidv4()
    })
    const { id: userId } = userData
    const result = await redisClient.set(`${site}:${userId}`, token)
    if (result === 'OK') {
      // invalidate /auth/user/:site/:id cache
      routeCache.removeCache(`/auth/user/${site}/${app}/${userId}`)
      res.cookie(
        `${TOKEN_COOKIE}.${site}`,
        cryptr.encrypt(`${userId}:${site}`),
        {
          httpOnly: true
        }
      )
      res.status(200).send(token)
    } else {
      res.status(500).send('something went wrong, try again')
    }
  }
})

router.get(
  '/user/:site/:app/:id',
  routeCache.cacheSeconds(60 * 60 * 60),
  async (req: Request, res: Response) => {
    const {
      params: { site, id }
    } = req
    const redisKey = `${site}:${id}`
    let token = await redisClient.get(redisKey)
    console.log('token:', token)
    if (token) {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        console.log('decoded:', decoded)
        if (err) {
          if (err instanceof TokenExpiredError && decoded) {
            token = jwt.sign(decoded, JWT_SECRET, { expiresIn: '1h' })
            redisClient.set(redisKey, token)
          } else {
            token = null
          }
        }
      })
    }
    if (token) {
      res.status(200).send(token)
    } else {
      res.status(400).send(`unable to find token for site, ${site}, id, ${id}`)
    }
  }
)

export default router
