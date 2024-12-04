import express from 'express'
import type { Request, Response, Express } from 'express'
import IoRedisStore from 'route-cache/ioRedisStore'
import routeCache from 'route-cache'
import cookieParser from 'cookie-parser'

import taskRoutes from './tasks'
import authRoutes from './auth'
import invalidateRoutes from './invalidate'
import { redisClient } from '../constants'

const app: Express = express()
console.log(process.env)
const port = process.env.PORT || 3000

const cacheStore = new IoRedisStore(redisClient)
routeCache.config({ cacheStore })

app.use(cookieParser())
app.use(express.json())
app.use('/tasks', taskRoutes)
app.use('/invalidate', invalidateRoutes)
app.use('/auth', authRoutes)

app.get('/', (_req: Request, res: Response) => {
  res.send('Crain JWT middleware')
})

app.use((err: Error, _req: Request, res: Response) => {
  console.log(err.stack)
  res.status(500).send('Something went wrong')
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

export default app
