import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './core/modules/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from './app.component';
import { NavbarComponent } from './core/layout/components/navbar/navbar.component';
import { FooterComponent } from './core/layout/components/footer/footer.component';
import { LoginComponent } from './core/auth/components/login/login.component';
import { RegistrationComponent } from './core/auth/components/registration/registration.component';
import { SpinnerComponent } from './core/layout/components/spinner/spinner.component';
import { ScrollToTopComponent } from './core/layout/components/scroll-to-top/scroll-to-top.component';

import { AccessComponent } from './core/auth/pages/access/access.component';
import { ActivationComponent } from './core/auth/pages/activation/activation.component';
import { NotFoundComponent } from './core/auth/pages/not-found/not-found.component';

import { AuthInterceptorService } from './core/auth/services/auth-interceptor.service';

import { HomeComponent } from './features/pages/home/home.component';

import { ProfileComponent } from './core/auth/pages/profile/profile.component';
import { ProfileFormComponent } from './core/auth/components/profile-form/profile-form.component';
import { CountdownModule } from 'ngx-countdown';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    RegistrationComponent,
    AccessComponent,
    ActivationComponent,
    SpinnerComponent,
    ScrollToTopComponent,
    NotFoundComponent,
    HomeComponent,
    ProfileComponent,
    ProfileFormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CountdownModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      closeButton: true,
      preventDuplicates: true,
      progressBar: true,
    }),
    HttpClientModule,
    MatTooltipModule,
    NgHttpLoaderModule.forRoot(),
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
