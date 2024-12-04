import Cryptr from 'cryptr'
import 'dotenv/config'
import Redis from 'ioredis'
import { get } from '@vercel/edge-config'

export const TOKEN_COOKIE = 'piano.token'
export const PELCRO_COOKIE = 'pelcro.user.auth.token'
export const cryptr = new Cryptr(process.env.ENCRYPT_SECRET ?? '')
export const redisClient = new Redis(
  Number(process.env.REDIS_PORT) || 6379,
  process.env.REDIS_SERVER ?? '127.0.0.1'
)
export const JWT_SECRET = process.env.JWT_SECRET ?? ''
export const PELCRO_API_DOMAIN =
  process.env.PELCRO_API_DOMAIN ?? 'https://staging.pelcro.com'
export const JWT_ORIGIN = get('jwt')
