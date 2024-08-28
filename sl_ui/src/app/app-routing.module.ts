import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessComponent } from './core/auth/pages/access/access.component';
import { NotFoundComponent } from './core/auth/pages/not-found/not-found.component';
import { RemoteLabComponent } from './features/pages/remote-lab/remote-lab.component';
import { AuthGuard } from './core/auth/services/guards/auth.guard';
import { ProfileComponent } from './core/auth/pages/profile/profile.component';
import { ActivationComponent } from './core/auth/pages/activation/activation.component';

const routes: Routes = [
  {
    path: '', redirectTo: '/access', pathMatch: 'full'
  },
  {
    path: 'access',
    component: AccessComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'remote-lab',
    component: RemoteLabComponent,
  },
  {
    path: 'activate',
    component: ActivationComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
