import { Request, Response, Router } from 'express'
import routeCache from 'route-cache'

const router = Router()

router.post('/auth/:site/:app', async (req: Request, res: Response) => {
  const {
    params: { site, app },
  } = req
  const { body:{ data: {object: { id }} }} = req;
  routeCache.removeCache(`/auth/user/${site}/${app}/${id}`)
  res.status(200).send(`invalidate cache for path /auth/user/${site}/${app}/${id}`)

})

export default router
