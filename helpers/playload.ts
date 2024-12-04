import { JWT_ORIGIN } from '../constants'
import { TransformedUser } from './types'
import get from 'lodash/get'

export const getPlayload = async (user: TransformedUser, app: string) => {
  const jwtOrigin = await JWT_ORIGIN;
  if (jwtOrigin) {
    const { [app]: jwt } = jwtOrigin as Record<string, Record<string, string>>;
    return Object.entries(jwt).reduce((acc, [key, value]) => {
      const keys = `${value}`.split('.')
      const prefix = keys[0]
      const rest = keys.slice(1).join('.')
      console.log(prefix, rest);
      return {
        ...acc,
        [key]: prefix === 'user' ? get(user, rest) : value
      }
    }, {})
  } else {
    return {};
  }
}
