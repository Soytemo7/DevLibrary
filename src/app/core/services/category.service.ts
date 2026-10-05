import {
  Injectable,
  inject,
} from '@angular/core'

import {
  HttpClient,
} from '@angular/common/http'

import {
  Observable,
} from 'rxjs'

import { environment } from '../../../environments/environment'

import {
  Category,
} from '../../models/resource.model'

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient)

  private readonly apiUrl =
    `${environment.apiUrl}/categories`

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(
      this.apiUrl,
    )
  }

  create(
    category: Partial<Category>,
  ): Observable<Category> {
    return this.http.post<Category>(
      this.apiUrl,
      category,
    )
  }
}