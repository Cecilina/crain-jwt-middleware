import { TransformedUser, User } from './types'
import uniq from 'lodash/uniq'
import isEmpty from 'lodash/isEmpty'

const getEntitlements = (user: User) => {
  const allEntitlements = [
    ...(user?.memberships?.flatMap(
      (membership) => membership?.subscription?.plan?.product?.entitlements
    ) || []),
    ...(user?.subscriptions?.flatMap(
      (sub) => sub?.plan?.product?.entitlements
    ) || [])
  ]

  return allEntitlements.length > 0 ? uniq(allEntitlements.filter(Boolean)) : []
}
export const transformUser = (user: User): TransformedUser => 
  ({
    ...user,
    entitlements: getEntitlements(user),
    hasMembership: !isEmpty(user?.memberships),
  })

