import {
  Component,
  inject,
  OnInit,
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

  resource: Resource | null = null

  loading = true

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug')

      if (!slug) {
        return
      }

      this.loading = true

      this.resourceService
        .getBySlug(slug)
        .subscribe({
          next: resource => {
            this.resource = resource
            this.loading = false
          },

          error: error => {
            console.error(error)

            this.loading = false
          },
        })
    })
  }
}