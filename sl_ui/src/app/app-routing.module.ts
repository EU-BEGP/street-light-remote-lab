import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { AccessComponent } from './core/pages/access/access.component';
import { CodeActivationComponent } from './core/pages/code-activation/code-activation.component';
import { ExperimentsComponent } from './features/pages/experiments/experiments.component';
import { LaboratoryComponent } from './features/pages/laboratory/laboratory.component';
import { LobbyComponent } from './core/pages/lobby/lobby.component';
import { NotFoundComponent } from './core/pages/not-found/not-found.component';
import { ProfileComponent } from './core/pages/profile/profile.component';
import { RemoteLabComponent } from './features/pages/remote-lab/remote-lab.component';

// Guards
import { AccessGuard } from './core/guards/access.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { CanDeactivateLabGuard } from './features/guards/can-deactivate-lab.guard';

const routes: Routes = [
  {
    path: '',
    component: AccessComponent,
    canActivate: [AccessGuard],
  },
  {
    path: 'laboratory',
    component: LaboratoryComponent,
  },
  {
    path: 'remote-lab',
    component: RemoteLabComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateLabGuard]
  },
  {
    path: 'experiments',
    component: ExperimentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-activation',
    component: CodeActivationComponent,
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
