import { base64decode } from 'nodejs-base64'
import { PELCRO_API_DOMAIN, redisClient } from '../constants'
import { transformUser } from './transform'

export const loadUser = async (token: string, siteId: string) => {
  // Define SDK pelcro to grab a user by authToken.
  try {
    const res = await redisClient.get(token);
    if (res) {
      return JSON.parse(res);
    }
    const response = await fetch(
      `${PELCRO_API_DOMAIN}/api/v1/sdk/customer/`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          auth_token: base64decode(token),
          site_id: siteId,
        }),
      },
    )
    const { data: userData } = await response.json()

    const user = transformUser(userData);
    redisClient.set(token, JSON.stringify(user), "EX", 10, "NX");
    return user;
  } catch (error) {
    console.log(
      'An error occurred while trying to retrieve the user information: ' +
        error
    )
    return null
  }
}
