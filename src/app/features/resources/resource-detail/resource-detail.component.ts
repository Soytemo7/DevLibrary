import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core'

import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router'

import {
  MatIconModule,
} from '@angular/material/icon'

import {
  MatButtonModule,
} from '@angular/material/button'

import {
  ResourceService,
} from '../../../core/services/resource.service'

import {
  Resource,
} from '../../../models/resource.model'

@Component({
  selector: 'app-resource-detail',

  standalone: true,

  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
  ],

  templateUrl:
    './resource-detail.component.html',

  styleUrl:
    './resource-detail.component.scss',
})
export class ResourceDetailComponent
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute)

  private readonly resourceService =
    inject(ResourceService)

  readonly resource =
    signal<Resource | null>(null)

  readonly loading =
    signal(true)

  readonly notFound =
    signal(false)

  readonly error =
    signal(false)

  ngOnInit(): void {

    this.route.paramMap.subscribe(
      params => {

        const slug =
          params.get('slug')

        if (!slug) {

          this.loading.set(false)

          this.notFound.set(true)

          return
        }

        this.loadResource(slug)
      },
    )
  }

  private loadResource(
    slug: string,
  ): void {

    this.loading.set(true)

    this.notFound.set(false)

    this.error.set(false)

    this.resource.set(null)

    console.log(
      '[RESOURCE DETAIL] Buscando:',
      slug,
    )

    this.resourceService
      .getBySlug(slug)
      .subscribe({

        next: resource => {

          console.log(
            '[RESOURCE DETAIL] Recurso recibido:',
            resource,
          )

          if (!resource) {

            this.notFound.set(true)

          } else {

            this.resource.set(
              resource,
            )
          }

          this.loading.set(false)
        },

        error: error => {

          console.error(
            '[RESOURCE DETAIL] Error:',
            error,
          )

          this.loading.set(false)

          this.error.set(true)
        },

      })
  }

  getTags(
    resource: Resource,
  ): string[] {

    if (
      !resource.tags ||
      !resource.tags.length
    ) {
      return []
    }

    const tags: string[] = []

    for (
      const tag of resource.tags
    ) {

      if (!tag) {
        continue
      }

      const separated =
        tag
          .split(/\s+/)
          .map(
            value => value.trim(),
          )
          .filter(
            value => value.length > 0,
          )

      tags.push(
        ...separated,
      )
    }

    return tags
  }

  getTechnologies(
    resource: Resource,
  ): string[] {

    if (
      !resource.technologies ||
      !resource.technologies.length
    ) {
      return []
    }

    const technologies: string[] = []

    for (
      const technology of resource.technologies
    ) {

      if (!technology) {
        continue
      }

      const separated =
        technology
          .split(/\s+/)
          .map(
            value => value.trim(),
          )
          .filter(
            value => value.length > 0,
          )

      technologies.push(
        ...separated,
      )
    }

    return technologies
  }
}