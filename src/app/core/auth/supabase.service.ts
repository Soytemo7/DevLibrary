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

    this.initialization =
      this.initialize()

    this.client.auth.onAuthStateChange(
      (_event, session) => {

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

    const {
      data: {
        session,
      },
    } =
      await this.client.auth.getSession()

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

    const {
      data,
      error,
    } =
      await this.client.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {

      throw error
    }

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
    } =
      await this.client.auth.getSession()

    return (
      session?.access_token ??
      null
    )
  }
}