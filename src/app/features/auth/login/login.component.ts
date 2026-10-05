import {
  Component,
  inject,
} from '@angular/core'

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'

import {
  Router,
} from '@angular/router'

import {
  MatFormFieldModule,
} from '@angular/material/form-field'

import {
  MatInputModule,
} from '@angular/material/input'

import {
  MatButtonModule,
} from '@angular/material/button'

import {
  MatIconModule,
} from '@angular/material/icon'

import {
  SupabaseService,
} from '../../../core/auth/supabase.service'

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],

  templateUrl: './login.component.html',

  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder)

  private readonly auth =
    inject(SupabaseService)

  private readonly router =
    inject(Router)

  loading = false

  error = ''

  readonly form = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
      ],
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
      ],
    ],
  })

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched()

      return
    }

    this.loading = true
    this.error = ''

    try {
      await this.auth.login(
        this.form.controls.email.value,
        this.form.controls.password.value,
      )

      await this.router.navigateByUrl('/')
    } catch (error) {
      console.error(error)

      this.error =
        'Correo o contraseña incorrectos.'
    } finally {
      this.loading = false
    }
  }
}