// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { BookingRealTime01Guard } from './features/guards/booking-real-time-01.guard';
import { BookingRealTime02Guard } from './features/guards/booking-real-time-02.guard';
import { HomeComponent } from './features/pages/home/home.component';

// Components
import { CodeActivationComponent } from './core/pages/code-activation/code-activation.component';
import { DataAnalysisActivityComponent } from './features/pages/data-analysis-activity/data-analysis-activity.component';
import { LightMonitoringActivityComponent } from './features/pages/light-monitoring-activity/light-monitoring-activity.component';
import { LobbyComponent } from './core/pages/lobby/lobby.component';
import { NotFoundComponent } from './core/pages/not-found/not-found.component';
import { RealTimeInteractionActivityComponent } from './features/pages/real-time-interaction-activity/real-time-interaction-activity.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'real-time-01',
    component: RealTimeInteractionActivityComponent,
    canActivate: [BookingRealTime01Guard, AuthGuard],
  },
  {
    path: 'real-time-02',
    component: LightMonitoringActivityComponent,
    canActivate: [BookingRealTime02Guard, AuthGuard],
  },
  {
    path: 'ultra-concurrent',
    component: DataAnalysisActivityComponent,
    canActivate: [AuthGuard]
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
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
