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
  MatFormFieldModule,
} from '@angular/material/form-field'

import {
  MatInputModule,
} from '@angular/material/input'

import {
  MatButtonModule,
} from '@angular/material/button'

import {
  MatSelectModule,
} from '@angular/material/select'

import {
  ResourceService,
} from '../../core/services/resource.service'

@Component({
  selector: 'app-admin',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],

  templateUrl:
    './admin.component.html',

  styleUrl:
    './admin.component.scss',
})
export class AdminComponent {
  private readonly fb = inject(FormBuilder)

  private readonly service =
    inject(ResourceService)

  saved = false

  readonly form = this.fb.nonNullable.group({
    title: [
      '',
      Validators.required,
    ],

    description: [''],

    url: [
      '',
      Validators.required,
    ],

    image: [''],

    type: [
      'WEB_PAGE',
      Validators.required,
    ],

    tags: [''],

    technologies: [''],

    notes: [''],

    featured: [false],
  })

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()

      return
    }

    const value = this.form.getRawValue()

    this.service
      .create({
        title: value.title,

        description:
          value.description,

        url: value.url,

        image: value.image,

        type: value.type as any,

        tags: value.tags
          .split(',')
          .map(value => value.trim())
          .filter(Boolean),

        technologies:
          value.technologies
            .split(',')
            .map(value => value.trim())
            .filter(Boolean),

        notes: value.notes,

        featured: value.featured,
      })
      .subscribe({
        next: () => {
          this.saved = true

          this.form.reset({
            type: 'WEB_PAGE',
            featured: false,
          })
        },

        error: error => {
          console.error(error)
        },
      })
  }
}