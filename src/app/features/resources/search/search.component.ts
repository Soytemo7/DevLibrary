import {
  Component,
  inject,
  OnInit,
} from '@angular/core'

import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms'

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router'

import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  switchMap,
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
    RouterLink,
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
  implements OnInit {

  private readonly service =
    inject(ResourceService)

  private readonly route =
    inject(ActivatedRoute)

  private readonly router =
    inject(Router)

  readonly searchControl =
    new FormControl('', {
      nonNullable: true,
    })

  resources: Resource[] = []

  allResources: Resource[] = []

  tags: string[] = []

  selectedTag = ''

  loading = false

  constructor() {

    this.searchControl.valueChanges
      .pipe(
        startWith(''),

        debounceTime(250),

        distinctUntilChanged(),

        switchMap(query => {

          this.loading = true

          const cleanQuery =
            query.trim()

          if (this.selectedTag) {

            return this.service.search(
              cleanQuery,
              this.selectedTag,
            )
          }

          return cleanQuery
            ? this.service.search(
                cleanQuery,
              )
            : this.service.getAll()
        }),
      )
      .subscribe({

        next: resources => {

          this.resources =
            Array.isArray(resources)
              ? resources
              : []

          this.loading = false
        },

        error: () => {

          this.resources = []

          this.loading = false
        },

      })
  }

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(
      params => {

        const tag =
          params.get('tag')?.trim() ?? ''

        this.selectedTag = tag

        this.loadTags()
      },
    )
  }

  private loadTags(): void {

    this.service
      .getAll()
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

  selectTag(tag: string): void {

    const cleanTag =
      tag.trim()

    if (!cleanTag) {
      return
    }

    this.selectedTag =
      cleanTag

    this.router.navigate(
      ['/search'],
      {
        queryParams: {
          tag: cleanTag,
        },
      },
    )

    this.searchControl.updateValueAndValidity()
    this.searchControl.setValue(
      this.searchControl.value,
    )
  }

  clearTag(): void {

    this.selectedTag = ''

    this.router.navigate(
      ['/search'],
    )

    this.searchControl.updateValueAndValidity()
    this.searchControl.setValue(
      this.searchControl.value,
    )
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
        !Array.isArray(resource.tags)
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
              tag => tag.trim(),
            )
            .filter(
              tag => tag.length > 0,
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
            sensitivity: 'base',
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
            tag => tag.trim(),
          )
          .filter(
            tag => tag.length > 0,
          )

      tags.push(
        ...separated,
      )
    }

    return tags
  }
}