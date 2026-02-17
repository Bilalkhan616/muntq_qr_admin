import { useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { AbilityContext, createAbility } from '../lib/ability'

interface AbilityProviderProps {
  children: React.ReactNode
}

export function AbilityProvider({ children }: AbilityProviderProps) {
  const user = useAuthStore((s) => s.user)
  const permissions = useAuthStore((s) => s.permissions)
  const ability = useMemo(
    () => createAbility(user, permissions),
    [user, permissions]
  )

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}
