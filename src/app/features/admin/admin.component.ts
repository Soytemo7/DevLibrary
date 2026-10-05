import {
  Component,
  inject,
  OnInit,
  signal,
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
  MatIconModule,
} from '@angular/material/icon'

import {
  ResourceService,
} from '../../core/services/resource.service'

import {
  Resource,
} from '../../models/resource.model'

@Component({
  selector: 'app-admin',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],

  templateUrl:
    './admin.component.html',

  styleUrl:
    './admin.component.scss',
})
export class AdminComponent
  implements OnInit {

  private readonly fb =
    inject(FormBuilder)

  private readonly service =
    inject(ResourceService)

  readonly resources =
    signal<Resource[]>([])

  editingId: string | null = null

  saved = false

  saving = false

  deletingId: string | null = null

  errorMessage = ''

  readonly form =
    this.fb.nonNullable.group({

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

  ngOnInit(): void {

    this.loadResources()
  }

  private loadResources(): void {

    this.errorMessage = ''

    this.service
      .getAll()
      .subscribe({

        next: resources => {

          this.resources.set(
            Array.isArray(resources)
              ? resources
              : [],
          )
        },

        error: error => {

          console.error(
            'Error al cargar recursos:',
            error,
          )

          this.resources.set([])

          this.errorMessage =
            'No fue posible cargar los recursos.'
        },

      })
  }

  save(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched()

      return
    }

    this.saving = true

    this.saved = false

    this.errorMessage = ''

    const value =
      this.form.getRawValue()

    const data = {

      title:
        value.title.trim(),

      description:
        value.description.trim(),

      url:
        value.url.trim(),

      image:
        value.image.trim(),

      type:
        value.type as any,

      tags:
        this.parseList(
          value.tags,
        ),

      technologies:
        this.parseList(
          value.technologies,
        ),

      notes:
        value.notes.trim(),

      featured:
        value.featured,

    }

    const request =
      this.editingId

        ? this.service.update(
            this.editingId,
            data,
          )

        : this.service.create(
            data,
          )

    request.subscribe({

      next: resource => {

        this.saving = false

        this.saved = true

        if (this.editingId) {

          this.resources.update(
            resources =>
              resources.map(
                current =>
                  current._id === resource._id
                    ? resource
                    : current,
              ),
          )

        } else {

          this.resources.update(
            resources => [
              resource,
              ...resources,
            ],
          )
        }

        this.resetForm()

      },

      error: error => {

        console.error(
          'Error al guardar recurso:',
          error,
        )

        this.saving = false

        this.errorMessage =
          'No fue posible guardar el recurso.'
      },

    })
  }

  edit(
    resource: Resource,
  ): void {

    this.editingId =
      resource._id

    this.saved = false

    this.errorMessage = ''

    this.form.patchValue({

      title:
        resource.title ?? '',

      description:
        resource.description ?? '',

      url:
        resource.url ?? '',

      image:
        resource.image ?? '',

      type:
        resource.type ?? 'WEB_PAGE',

      tags:
        this.formatList(
          resource.tags,
        ),

      technologies:
        this.formatList(
          resource.technologies,
        ),

      notes:
        resource.notes ?? '',

      featured:
        resource.featured ?? false,

    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  cancelEdit(): void {

    this.resetForm()
  }

  delete(
    resource: Resource,
  ): void {

    if (!resource._id) {
      return
    }

    const confirmed =
      window.confirm(
        `¿Eliminar "${resource.title}"?\n\nEsta acción no se puede deshacer.`,
      )

    if (!confirmed) {
      return
    }

    this.deletingId =
      resource._id

    this.errorMessage = ''

    this.service
      .delete(resource._id)
      .subscribe({

        next: () => {

          this.resources.update(
            resources =>
              resources.filter(
                current =>
                  current._id !== resource._id,
              ),
          )

          this.deletingId = null

          if (
            this.editingId ===
            resource._id
          ) {

            this.resetForm()
          }

        },

        error: error => {

          console.error(
            'Error al eliminar recurso:',
            error,
          )

          this.deletingId = null

          this.errorMessage =
            'No fue posible eliminar el recurso.'
        },

      })
  }

  private resetForm(): void {

    this.editingId = null

    this.form.reset({

      title: '',

      description: '',

      url: '',

      image: '',

      type: 'WEB_PAGE',

      tags: '',

      technologies: '',

      notes: '',

      featured: false,

    })
  }

  private parseList(
    value: string,
  ): string[] {

    return value
      .split(',')
      .map(
        item => item.trim(),
      )
      .filter(
        Boolean,
      )
  }

  private formatList(
    values:
      string[] | undefined,
  ): string {

    if (
      !values ||
      values.length === 0
    ) {

      return ''
    }

    return values.join(', ')
  }
}