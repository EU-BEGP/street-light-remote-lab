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
import { ExperimentDialogComponent } from './features/components/experiment-dialog/experiment-dialog.component';
import { ExperimentsComponent } from './features/pages/experiments/experiments.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { IntensityChartComponent } from './features/components/intensity-chart/intensity-chart.component';
import { IntensityGridComponent } from './features/components/intensity-grid/intensity-grid.component';
import { LaboratoryComponent } from './features/pages/laboratory/laboratory.component';
import { LightControlComponent } from './features/components/light-control/light-control.component';
import { LobbyComponent } from './core/pages/lobby/lobby.component';
import { LoginComponent } from './core/components/login/login.component';
import { NavbarComponent } from './core/components/navbar/navbar.component';
import { NotFoundComponent } from './core/pages/not-found/not-found.component';
import { ProfileComponent } from './core/pages/profile/profile.component';
import { ProfileFormComponent } from './core/components/profile-form/profile-form.component';
import { RegistrationComponent } from './core/components/registration/registration.component';
import { RemoteLabComponent } from './features/pages/remote-lab/remote-lab.component';
import { ScrollToTopComponent } from './core/components/scroll-to-top/scroll-to-top.component';
import { SpinnerComponent } from './core/components/spinner/spinner.component';

// Services
import { AuthInterceptorService } from './core/services/auth-interceptor.service';

// Plotly
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    AccessComponent,
    AppComponent,
    CodeActivationComponent,
    ConfirmationDialogComponent,
    ExperimentDialogComponent,
    ExperimentsComponent,
    FooterComponent,
    IntensityChartComponent,
    IntensityGridComponent,
    LaboratoryComponent,
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
