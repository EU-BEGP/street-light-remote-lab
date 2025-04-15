// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { CountdownModule } from 'ngx-countdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaterialModule } from './material.module';
import { NgxHttpLoaderModule } from 'ngx-http-loader';
import { ToastrModule } from 'ngx-toastr';

// Components
import { AccessComponent } from './core/pages/access/access.component';
import { AppComponent } from './app.component';
import { CodeActivationComponent } from './core/pages/code-activation/code-activation.component';
import { ConfirmationDialogComponent } from './core/components/confirmation-dialog/confirmation-dialog.component';
import { DataAnalysisActivityComponent } from './features/pages/data-analysis-activity/data-analysis-activity.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { GridSelectorComponent } from './features/components/grid-selector/grid-selector.component';
import { IntensityChartComponent } from './features/components/intensity-chart/intensity-chart.component';
import { IntensityMatrixComponent } from './features/components/intensity-matrix/intensity-matrix.component';
import { LaboratoryComponent } from './features/pages/laboratory/laboratory.component';
import { LightControlComponent } from './features/components/light-control/light-control.component';
import { LightInformationComponent } from './features/components/light-information/light-information.component';
import { LightMonitoringActivityComponent } from './features/pages/light-monitoring-activity/light-monitoring-activity.component';
import { LightSimulationComponent } from './features/components/light-simulation/light-simulation.component';
import { LobbyComponent } from './core/pages/lobby/lobby.component';
import { LoginComponent } from './core/components/login/login.component';
import { ObjectControlComponent } from './features/components/object-control/object-control.component';
import { NavbarComponent } from './core/components/navbar/navbar.component';
import { NotFoundComponent } from './core/pages/not-found/not-found.component';
import { ProfileComponent } from './core/pages/profile/profile.component';
import { RealTimeInteractionActivityComponent } from './features/pages/real-time-interaction-activity/real-time-interaction-activity.component';
import { RegistrationComponent } from './core/components/registration/registration.component';
import { RobotCameraComponent } from './features/components/robot-camera/robot-camera.component';
import { ScrollToTopComponent } from './core/components/scroll-to-top/scroll-to-top.component';
import { SpinnerComponent } from './core/components/spinner/spinner.component';

// Services
import { AuthInterceptorService } from './core/services/auth-interceptor.service';

// Plotly
import { PlotlyViaWindowModule } from 'angular-plotly.js';

@NgModule({
  declarations: [
    AccessComponent,
    AppComponent,
    CodeActivationComponent,
    ConfirmationDialogComponent,
    FooterComponent,
    GridSelectorComponent,
    IntensityChartComponent,
    IntensityMatrixComponent,
    LaboratoryComponent,
    LightControlComponent,
    LightInformationComponent,
    LightSimulationComponent,
    LobbyComponent,
    LoginComponent,
    ObjectControlComponent,
    NavbarComponent,
    NotFoundComponent,
    ProfileComponent,
    RegistrationComponent,
    RobotCameraComponent,
    ScrollToTopComponent,
    SpinnerComponent,
    RealTimeInteractionActivityComponent,
    DataAnalysisActivityComponent,
    LightMonitoringActivityComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CountdownModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    NgxHttpLoaderModule.forRoot(),
    PlotlyViaWindowModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      closeButton: true,
      preventDuplicates: true,
      progressBar: true,
    }),
  ],
  providers: [
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
