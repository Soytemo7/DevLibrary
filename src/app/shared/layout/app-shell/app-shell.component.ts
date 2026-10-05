import {
  Component,
  inject,
} from '@angular/core'

import {
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router'

import {
  MatIconModule,
} from '@angular/material/icon'

import {
  MatButtonModule,
} from '@angular/material/button'

import {
  SupabaseService,
} from '../../../core/auth/supabase.service'

@Component({
  selector: 'app-shell',
  standalone: true,

  imports: [
    RouterOutlet,
    RouterLink,
    MatIconModule,
    MatButtonModule,
  ],

  templateUrl: './app-shell.component.html',

  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly auth =
    inject(SupabaseService)

  private readonly router =
    inject(Router)

  async logout(): Promise<void> {
    await this.auth.logout()

    await this.router.navigateByUrl('/login')
  }
}