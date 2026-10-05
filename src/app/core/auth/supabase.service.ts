import {
  Injectable,
  signal,
} from '@angular/core'

import {
  createClient,
  type Session,
  type User,
} from '@supabase/supabase-js'

import {
  environment,
} from '../../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {

  private readonly client =
    createClient(
      environment.supabaseUrl,
      environment.supabasePublishableKey,
    )

  readonly session =
    signal<Session | null>(null)

  readonly user =
    signal<User | null>(null)

  private readonly initialization:
    Promise<void>

  constructor() {

    console.log(
      '[SUPABASE] Servicio iniciado',
    )

    console.log(
      '[SUPABASE] URL:',
      environment.supabaseUrl,
    )

    this.initialization =
      this.initialize()

    this.client.auth.onAuthStateChange(
      (event, session) => {

        console.log(
          '[SUPABASE] Auth event:',
          event,
        )

        console.log(
          '[SUPABASE] Sesión:',
          session
            ? 'PRESENTE'
            : 'AUSENTE',
        )

        this.session.set(
          session,
        )

        this.user.set(
          session?.user ?? null,
        )
      },
    )
  }

  private async initialize(): Promise<void> {

    console.log(
      '[SUPABASE] Inicializando sesión...',
    )

    const {
      data: {
        session,
      },
      error,
    } =
      await this.client.auth.getSession()

    console.log(
      '[SUPABASE] getSession error:',
      error,
    )

    console.log(
      '[SUPABASE] getSession sesión:',
      session
        ? 'PRESENTE'
        : 'AUSENTE',
    )

    this.session.set(
      session,
    )

    this.user.set(
      session?.user ?? null,
    )
  }

  async login(
    email: string,
    password: string,
  ): Promise<void> {

    console.log(
      '[SUPABASE] Intentando login...',
    )

    const {
      data,
      error,
    } =
      await this.client.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {

      console.error(
        '[SUPABASE] Error login:',
        error,
      )

      throw error
    }

    console.log(
      '[SUPABASE] Login correcto:',
      data.session
        ? 'SESIÓN OBTENIDA'
        : 'SIN SESIÓN',
    )

    this.session.set(
      data.session,
    )

    this.user.set(
      data.user,
    )
  }

  async logout(): Promise<void> {

    await this.client.auth.signOut()

    this.session.set(
      null,
    )

    this.user.set(
      null,
    )
  }

  async getAccessToken(): Promise<string | null> {

    await this.initialization

    const {
      data: {
        session,
      },
      error,
    } =
      await this.client.auth.getSession()

    console.log(
      '[SUPABASE] getAccessToken error:',
      error,
    )

    console.log(
      '[SUPABASE] getAccessToken:',
      session
        ? 'TOKEN DISPONIBLE'
        : 'SIN TOKEN',
    )

    return (
      session?.access_token ??
      null
    )
  }
}