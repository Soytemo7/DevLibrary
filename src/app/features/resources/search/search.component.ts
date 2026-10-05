import {
  Component,
  inject,
} from '@angular/core'

import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms'

import {
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
export class SearchComponent {
  private readonly service =
    inject(ResourceService)

  readonly searchControl =
    new FormControl('', {
      nonNullable: true,
    })

  resources: Resource[] = []

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        startWith(''),

        debounceTime(250),

        distinctUntilChanged(),

        switchMap(query =>
          query.trim()
            ? this.service.search(query)
            : this.service.getAll(),
        ),
      )
      .subscribe({
        next: resources => {
          this.resources = resources
        },
      })
  }
}