import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core'

import {
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
  selector: 'app-home',

  standalone: true,

  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
  ],

  templateUrl:
    './home.component.html',

  styleUrl:
    './home.component.scss',
})
export class HomeComponent
  implements OnInit {

  private readonly resourceService =
    inject(ResourceService)

  readonly resources =
    signal<Resource[]>([])

  readonly loading =
    signal(true)

  readonly error =
    signal(false)

  readonly displayedResources =
    signal<Resource[]>([])

  readonly currentPage =
    signal(1)

  readonly totalPages =
    signal(1)

  readonly pageSize = 20

  ngOnInit(): void {

    this.loadResources()
  }

  private loadResources(): void {

    this.loading.set(true)

    this.error.set(false)

    this.resourceService
      .getPaginated(
        this.currentPage(),
        this.pageSize,
      )
      .subscribe({

        next: response => {

          const safeResources =
            Array.isArray(
              response.resources,
            )
              ? response.resources
              : []

          this.resources.set(
            safeResources,
          )

          this.displayedResources.set(
            safeResources,
          )

          this.totalPages.set(
            Math.max(
              response.totalPages,
              1,
            ),
          )

          this.loading.set(false)
        },

        error: error => {

          console.error(
            'Error al cargar los recursos:',
            error,
          )

          this.resources.set([])

          this.displayedResources.set([])

          this.error.set(true)

          this.loading.set(false)
        },

      })
  }

  previousPage(): void {

    if (
      this.currentPage() <= 1
    ) {
      return
    }

    this.currentPage.update(
      page => page - 1,
    )

    this.loadResources()
  }

  nextPage(): void {

    if (
      this.currentPage() >=
      this.totalPages()
    ) {
      return
    }

    this.currentPage.update(
      page => page + 1,
    )

    this.loadResources()
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
        ...separated
      )
    }

    return tags.slice(0, 3)
  }
}