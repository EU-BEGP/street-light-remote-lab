import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';
import config from 'src/app/config.json'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  hidePassword: boolean = true;
  passwordResetUrl = `${config.api.baseUrl}${config.api.users.passwordReset}`;

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]

  })

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void { }


  /*** HTML interaction functions ***/

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loginUser()
    } else {
      this.toastr.error(
        'Please, complete correctly the information.',
        'Invalid action'
      );
    }
  }

  /*** Service interaction functions ***/

  loginUser(): void {
    const loginFormValue: any = this.loginForm.value;
    const user: User = {
      'email': loginFormValue.email,
      'password': loginFormValue.password
    }

    this.authService.login(user).subscribe({
      next: (response: any): void => {
        if (response != undefined) {
          localStorage.setItem('token', response.body.token);
          this.checkReturnUrl();
          this.router.navigateByUrl('/experiments');
          this.toastr.success(`Welcome ${user.email}`);
        }
      }
    });
  }

  /*** Internal functions ***/

  checkReturnUrl() {
    let params = new URLSearchParams(document.location.search);
    let returnUrl = params.get('return-url');

    if (returnUrl) this.router.navigateByUrl(returnUrl);
    else {
      this.router.navigateByUrl('');
    }
  }

  /* Form manipulation */

  // Getters
  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }
}
