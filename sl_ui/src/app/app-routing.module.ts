import { NgModule } from '@angular/core';
import { AccessComponent } from './core/auth/pages/access/access.component';
import { ActivationComponent } from './core/auth/pages/activation/activation.component';
import { CanDeactivateLabGuard } from './features/services/guards/can-deactivate-lab.guard';
import { ExperimentsComponent } from './features/components/experiments/experiments.component';
import { LobbyComponent } from './core/layout/pages/lobby/lobby.component';
import { NotFoundComponent } from './core/auth/pages/not-found/not-found.component';
import { ProfileComponent } from './core/auth/pages/profile/profile.component';
import { RemoteLabComponent } from './features/pages/remote-lab/remote-lab.component';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AccessGuard } from './core/auth/guards/access.guard';

const routes: Routes = [
  {
    path: '',
    component: AccessComponent,
    canActivate: [AccessGuard],
  },
  {
    path: 'remote-lab',
    component: RemoteLabComponent,
    canDeactivate: [CanDeactivateLabGuard]
  },
  {
    path: 'experiments',
    component: ExperimentsComponent,
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
    path: 'lobby',
    component: LobbyComponent,
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
