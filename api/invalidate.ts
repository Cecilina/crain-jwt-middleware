import { Request, Response, Router } from 'express'
import routeCache from 'route-cache'
import { JWT_SECRET, redisClient } from '../constants'
import { transformUser } from '../helpers/transform'
import { getPlayload } from '../helpers/playload'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken';

const router = Router()

router.get('/task/:id', (req: Request, res: Response) => {
  routeCache.removeCache(`/tasks/${req.params.id}`)
  routeCache.removeCache('/tasks')
  res.status(200).send(`invalidate cache for path /tasks/${req.params.id}`)
  return
})

router.post('/auth/:site/:app', async (req: Request, res: Response) => {
  const {
    params: { site, app },
  } = req
  const { data: {object: user} } = req.body;
  const { id: userId } = user;
  const token = jwt.sign({ ...await getPlayload(transformUser(user), app), site }, JWT_SECRET, {
    expiresIn: '1h',
    jwtid: uuidv4(),
  })
  console.log(token);
  const result = await redisClient.set(`${site}:${userId}`, token)
  if (result === 'OK') {
    routeCache.removeCache(`/auth/user/${site}/${app}/${userId}`)
    res.status(200).send(`invalidate cache for path /auth/user/${site}/${app}/${userId}`)
  } else {
    throw new Error('webhook invalidate error');
  }
})

export default router
