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

        console.log(
          '[AUTH INTERCEPTOR] URL:',
          req.url,
        )

        console.log(
          '[AUTH INTERCEPTOR] Token:',
          token
            ? 'TOKEN PRESENTE'
            : 'TOKEN AUSENTE',
        )

        if (!token) {

          console.error(
            '[AUTH INTERCEPTOR] NO HAY TOKEN',
          )

          return next(req)
        }

        const authenticatedRequest =
          req.clone({
            setHeaders: {
              Authorization:
                `Bearer ${token}`,
            },
          })

        console.log(
          '[AUTH INTERCEPTOR] Authorization agregado',
        )

        return next(
          authenticatedRequest,
        )
      },
    ),
  )
}