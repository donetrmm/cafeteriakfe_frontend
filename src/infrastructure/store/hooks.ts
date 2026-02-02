import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export function useCan(permission: string): boolean {
  const user = useAppSelector((state) => state.auth.user)
  
  if (!user) return false
  
  return user.permissions?.includes(permission) ?? false
}
