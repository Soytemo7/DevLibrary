import {
  Component,
  inject,
  OnInit,
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

  resources: Resource[] = []

  featured: Resource[] = []

  ngOnInit(): void {

    this.resourceService
      .getAll()
      .subscribe({

        next: resources => {

          this.resources = resources

          const featured =
            resources
              .filter(
                resource =>
                  resource.featured,
              )
              .slice(0, 6)

          this.featured =
            featured.length
              ? featured
              : resources.slice(0, 6)
        },

        error: error => {

          console.error(
            'Error al cargar los recursos:',
            error,
          )

        },

      })
  }
}