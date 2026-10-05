import {
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core'

import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms'

import {
  ActivatedRoute,
  Router,
} from '@angular/router'

import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  takeUntil,
} from 'rxjs'

import {
  MatIconModule,
} from '@angular/material/icon'

import {
  MatFormFieldModule,
} from '@angular/material/form-field'

import {
  MatInputModule,
} from '@angular/material/input'

import {
  ResourceService,
} from '../../../core/services/resource.service'

import {
  Resource,
} from '../../../models/resource.model'

@Component({
  selector: 'app-search',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],

  templateUrl:
    './search.component.html',

  styleUrl:
    './search.component.scss',
})
export class SearchComponent
  implements OnInit, OnDestroy {

  private readonly service =
    inject(ResourceService)

  private readonly route =
    inject(ActivatedRoute)

  private readonly router =
    inject(Router)

  private readonly destroy$ =
    new Subject<void>()

  readonly searchControl =
    new FormControl('', {
      nonNullable: true,
    })

  resources: Resource[] = []

  allResources: Resource[] = []

  tags: string[] = []

  selectedTag = ''

  loading = false

  ngOnInit(): void {

    this.loadTags()

    this.route.queryParamMap
      .pipe(
        map(
          params =>
            params.get('tag')?.trim() ?? '',
        ),
        distinctUntilChanged(),
        takeUntil(
          this.destroy$,
        ),
      )
      .subscribe(
        tag => {

          this.selectedTag =
            tag

          this.search()
        },
      )

    this.searchControl.valueChanges
      .pipe(
        map(
          value =>
            value.trim(),
        ),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(
          this.destroy$,
        ),
      )
      .subscribe(
        () => {
          this.search()
        },
      )

    this.search()
  }

  private search(): void {

    const query =
      this.searchControl.value.trim()

    const tag =
      this.selectedTag.trim()

    this.loading = true

    if (
      !query &&
      !tag
    ) {

      this.service
        .getAll()
        .pipe(
          takeUntil(
            this.destroy$,
          ),
        )
        .subscribe({

          next: resources => {

            this.resources =
              Array.isArray(resources)
                ? resources
                : []

            this.loading = false
          },

          error: error => {

            console.error(
              'Error al cargar recursos:',
              error,
            )

            this.resources = []
            this.loading = false
          },

        })

      return
    }

    this.service
      .search(
        query,
        tag || undefined,
      )
      .pipe(
        takeUntil(
          this.destroy$,
        ),
      )
      .subscribe({

        next: resources => {

          this.resources =
            Array.isArray(resources)
              ? resources
              : []

          this.loading = false
        },

        error: error => {

          console.error(
            'Error al buscar recursos:',
            error,
          )

          this.resources = []
          this.loading = false
        },

      })
  }

  searchImmediately(): void {
    this.search()
  }

  selectTag(
    tag: string,
  ): void {

    const cleanTag =
      tag.trim()

    if (!cleanTag) {
      return
    }

    this.router.navigate(
      ['/search'],
      {
        queryParams: {
          tag: cleanTag,
        },
      },
    )
  }

  clearTag(): void {

    this.router.navigate(
      ['/search'],
      {
        queryParams: {},
      },
    )
  }

  openResource(
    slug: string,
  ): void {

    this.router.navigate([
      '/resource',
      slug,
    ])
  }

  private loadTags(): void {

    this.service
      .getAll()
      .pipe(
        takeUntil(
          this.destroy$,
        ),
      )
      .subscribe({

        next: resources => {

          this.allResources =
            Array.isArray(resources)
              ? resources
              : []

          this.tags =
            this.extractTags(
              this.allResources,
            )
        },

        error: () => {

          this.allResources = []
          this.tags = []
        },

      })
  }

  private extractTags(
    resources: Resource[],
  ): string[] {

    const tagSet =
      new Set<string>()

    for (
      const resource of resources
    ) {

      if (
        !resource.tags ||
        !Array.isArray(
          resource.tags,
        )
      ) {
        continue
      }

      for (
        const value of resource.tags
      ) {

        if (!value) {
          continue
        }

        const separated =
          value
            .split(/\s+/)
            .map(
              tag =>
                tag.trim(),
            )
            .filter(
              tag =>
                tag.length > 0,
            )

        for (
          const tag of separated
        ) {

          tagSet.add(tag)
        }
      }
    }

    return Array.from(
      tagSet,
    ).sort(
      (a, b) =>
        a.localeCompare(
          b,
          'es',
          {
            sensitivity:
              'base',
          },
        ),
    )
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
      const value of resource.tags
    ) {

      if (!value) {
        continue
      }

      const separated =
        value
          .split(/\s+/)
          .map(
            tag =>
              tag.trim(),
          )
          .filter(
            tag =>
              tag.length > 0,
          )

      tags.push(
        ...separated,
      )
    }

    return tags
  }

  ngOnDestroy(): void {

    this.destroy$.next()
    this.destroy$.complete()
  }
}