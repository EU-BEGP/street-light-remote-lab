import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { CountdownModule } from 'ngx-countdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaterialModule } from './core/material/material.module';
import { NgxHttpLoaderModule } from 'ngx-http-loader';
import { ToastrModule } from 'ngx-toastr';

// Components
import { AppComponent } from './app.component';
import { ConfirmationDialogComponent } from './core/layout/components/confirmation-dialog/confirmation-dialog.component';
import { FooterComponent } from './core/layout/components/footer/footer.component';
import { LobbyComponent } from './core/layout/pages/lobby/lobby.component';
import { NavbarComponent } from './core/layout/components/navbar/navbar.component';
import { ScrollToTopComponent } from './core/layout/components/scroll-to-top/scroll-to-top.component';
import { SpinnerComponent } from './core/layout/components/spinner/spinner.component';

// Auth Components
import { AccessComponent } from './core/auth/pages/access/access.component';
import { ActivationComponent } from './core/auth/pages/activation/activation.component';
import { LoginComponent } from './core/auth/components/login/login.component';
import { NotFoundComponent } from './core/auth/pages/not-found/not-found.component';
import { ProfileComponent } from './core/auth/pages/profile/profile.component';
import { ProfileFormComponent } from './core/auth/components/profile-form/profile-form.component';
import { RegistrationComponent } from './core/auth/components/registration/registration.component';

// Features Components
import { ExperimentDialogComponent } from './features/components/experiment-dialog/experiment-dialog.component';
import { ExperimentsComponent } from './features/components/experiments/experiments.component';
import { IntensityChartComponent } from './features/components/intensity-chart/intensity-chart.component';
import { IntensityGridComponent } from './features/components/intensity-grid/intensity-grid.component';
import { LightControlComponent } from './features/components/light-control/light-control.component';
import { RemoteLabComponent } from './features/pages/remote-lab/remote-lab.component';

// Services
import { AuthInterceptorService } from './core/auth/services/auth-interceptor.service';

// Plotly
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    AccessComponent,
    ActivationComponent,
    AppComponent,
    ConfirmationDialogComponent,
    ExperimentDialogComponent,
    ExperimentsComponent,
    FooterComponent,
    IntensityChartComponent,
    IntensityGridComponent,
    LightControlComponent,
    LobbyComponent,
    LoginComponent,
    NavbarComponent,
    NotFoundComponent,
    ProfileComponent,
    ProfileFormComponent,
    RegistrationComponent,
    RemoteLabComponent,
    ScrollToTopComponent,
    SpinnerComponent,
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
    PlotlyModule,
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
