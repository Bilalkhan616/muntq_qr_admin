import { createContext } from 'react'
import { createMongoAbility, type MongoAbility } from '@casl/ability'
import { createContextualCan } from '@casl/react'
import type { Permission, User } from '../types/api'

export type Actions = 'read' | 'create' | 'update' | 'delete' | 'manage'
export type Subjects = 'Dashboard' | 'Logs' | 'User' | 'Role' | 'Scan' | 'all'

export type AppAbility = MongoAbility<[Actions, Subjects]>

const defaultAbility = createMongoAbility<[Actions, Subjects]>([])
export const AbilityContext = createContext<AppAbility>(defaultAbility)
export const Can = createContextualCan(AbilityContext.Consumer)

/** Maps API permission keys to CASL rules for sidebar/nav. */
function permissionKeysToRules(permissions: Permission[]) {
  const keys = new Set(permissions.map((p) => p.key))
  const rules: Array<{ action: Actions; subject: Subjects | Subjects[] }> = []

  // Dashboard: show for all authenticated users
  rules.push({ action: 'read', subject: 'Dashboard' })

  // auth.register → create User (Register nav)
  if (keys.has('auth.register')) {
    rules.push({ action: 'create', subject: 'User' })
  }

  // log.user_log, log.scan_log → read Logs and read User (Users table)
  if (keys.has('log.user_log') || keys.has('log.scan_log')) {
    rules.push({ action: 'read', subject: 'Logs' })
    rules.push({ action: 'read', subject: 'User' })
  }

  // role.manage → manage Role
  if (keys.has('role.manage')) {
    rules.push({ action: 'manage', subject: 'Role' })
  }

  // scan.submit → manage Scan
  if (keys.has('scan.submit')) {
    rules.push({ action: 'manage', subject: 'Scan' })
  }

  return rules
}

export function createAbility(
  user: User | null,
  permissions: Permission[] = []
): AppAbility {
  const ability = createMongoAbility<[Actions, Subjects]>([])

  if (!user) return ability

  // superAdmin bypasses permission checks
  if (user.role === 'superAdmin') {
    ability.update([{ action: 'manage', subject: 'all' }])
    return ability
  }

  const rules = permissionKeysToRules(permissions)
  ability.update(rules)
  return ability
}
