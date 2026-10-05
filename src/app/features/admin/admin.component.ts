import {
  Component,
  inject,
  OnInit,
} from '@angular/core'

import {
  ActivatedRoute,
  Router,
} from '@angular/router'

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'

import {
  finalize,
} from 'rxjs'

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

  private readonly route =
    inject(ActivatedRoute)

  private readonly router =
    inject(Router)

  editingId: string | null = null

  editingSlug: string | null = null

  saved = false

  saving = false

  loading = false

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

    const editSlug =
      this.route.snapshot.queryParamMap.get(
        'edit',
      )

    if (!editSlug) {

      this.prepareNewResource()

      return
    }

    const storedResource =
      sessionStorage.getItem(
        'devlibrary-edit-resource',
      )

    if (storedResource) {

      try {

        const resource =
          JSON.parse(
            storedResource,
          ) as Resource

        /*
         * Evitamos que el recurso viejo quede
         * almacenado después de cargarlo.
         */

        sessionStorage.removeItem(
          'devlibrary-edit-resource',
        )

        this.loadResourceIntoForm(
          resource,
        )

        return

      } catch {

        sessionStorage.removeItem(
          'devlibrary-edit-resource',
        )
      }
    }

    /*
     * Si entramos directamente a:
     *
     * /admin?edit=opencapture
     *
     * hacemos la consulta normal al backend.
     */

    this.loadResourceFromApi(
      editSlug,
    )
  }

  private prepareNewResource(): void {

    this.editingId = null

    this.editingSlug = null

    this.saved = false

    this.loading = false

    this.errorMessage = ''

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

  private loadResourceIntoForm(
    resource: Resource,
  ): void {

    this.editingId =
      resource._id

    this.editingSlug =
      resource.slug

    this.saved = false

    this.loading = false

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
  }

  private loadResourceFromApi(
    slug: string,
  ): void {

    this.loading = true

    this.errorMessage = ''

    this.service
      .getBySlug(slug)
      .pipe(
        finalize(() => {

          this.loading = false

        }),
      )
      .subscribe({

        next: resource => {

          if (!resource) {

            this.errorMessage =
              'No fue posible encontrar el recurso.'

            return
          }

          this.loadResourceIntoForm(
            resource,
          )
        },

        error: () => {

          this.errorMessage =
            'No fue posible cargar el recurso para editarlo.'
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

    const data: Partial<Resource> = {

      title:
        value.title.trim(),

      description:
        value.description.trim(),

      url:
        value.url.trim(),

      image:
        value.image.trim(),

      type:
        value.type as Resource['type'],

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

        this.router.navigate([
          '/resource',
          resource.slug,
        ])
      },

      error: () => {

        this.saving = false

        this.errorMessage =
          'No fue posible guardar el recurso.'
      },

    })
  }

  cancelEdit(): void {

    if (this.editingSlug) {

      this.router.navigate([
        '/resource',
        this.editingSlug,
      ])

      return
    }

    this.router.navigate([
      '/',
    ])
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