import {
  inject,
} from '@angular/core'

import {
  HttpInterceptorFn,
} from '@angular/common/http'

import {
  from,
} from 'rxjs'

import {
  switchMap,
} from 'rxjs/operators'

import {
  SupabaseService,
} from '../auth/supabase.service'

export const authInterceptor: HttpInterceptorFn = (
  req,
  next,
) => {

  const supabaseService =
    inject(SupabaseService)

  return from(
    supabaseService.getAccessToken(),
  ).pipe(

    switchMap(
      (token) => {

        if (!token) {

          return next(req)
        }

        const authenticatedRequest =
          req.clone({
            setHeaders: {
              Authorization:
                `Bearer ${token}`,
            },
          })

        return next(
          authenticatedRequest,
        )
      },
    ),
  )
}