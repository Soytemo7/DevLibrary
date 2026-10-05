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
  Resource,
} from '../../models/resource.model'

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private readonly http = inject(HttpClient)

  private readonly apiUrl =
    `${environment.apiUrl}/resources`

  getAll(): Observable<Resource[]> {
    return this.http.get<Resource[]>(
      this.apiUrl,
    )
  }

  getBySlug(slug: string): Observable<Resource> {
    return this.http.get<Resource>(
      `${this.apiUrl}/${slug}`,
    )
  }

  search(
  query: string,
  tag?: string,
): Observable<Resource[]> {

  const params: {
    q?: string
    tag?: string
  } = {}

  if (query.trim()) {

    params.q =
      query.trim()
  }

  if (tag?.trim()) {

    params.tag =
      tag.trim()
  }

  return this.http.get<Resource[]>(
    `${this.apiUrl}/search`,
    {
      params,
    },
  )
}

  create(
    resource: Partial<Resource>,
  ): Observable<Resource> {
    return this.http.post<Resource>(
      this.apiUrl,
      resource,
    )
  }

  update(
    id: string,
    resource: Partial<Resource>,
  ): Observable<Resource> {
    return this.http.put<Resource>(
      `${this.apiUrl}/${id}`,
      resource,
    )
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
    )
  }
}