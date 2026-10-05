import {
  Routes,
} from '@angular/router'

import {
  authGuard,
} from './core/guards/auth.guard'

import {
  AppShellComponent,
} from './shared/layout/app-shell/app-shell.component'

export const routes: Routes = [

  {
    path: 'login',

    loadComponent: () =>
      import(
        './features/auth/login/login.component'
      ).then(
        m => m.LoginComponent,
      ),
  },

  {
    path: '',

    component: AppShellComponent,

    canActivate: [
      authGuard,
    ],

    children: [

      {
        path: '',

        loadComponent: () =>
          import(
            './features/home/home/home.component'
          ).then(
            m => m.HomeComponent,
          ),
      },

      {
        path: 'resource/:slug',

        loadComponent: () =>
          import(
            './features/resources/resource-detail/resource-detail.component'
          ).then(
            m =>
              m.ResourceDetailComponent,
          ),
      },

      {
        path: 'search',

        loadComponent: () =>
          import(
            './features/resources/search/search.component'
          ).then(
            m => m.SearchComponent,
          ),
      },

      {
        path: 'admin',

        loadComponent: () =>
          import(
            './features/admin/admin.component'
          ).then(
            m => m.AdminComponent,
          ),
      },

    ],
  },

  {
    path: '**',

    redirectTo: '',
  },
]