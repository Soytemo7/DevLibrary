import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'

import { SupabaseService } from '../auth/supabase.service'

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService)
  const router = inject(Router)

  const token = await supabase.getAccessToken()

  if (token) {
    return true
  }

  return router.createUrlTree(['/login'])
}