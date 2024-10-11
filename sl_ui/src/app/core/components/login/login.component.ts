import config from 'src/app/config.json'
import { AuthService } from '../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from '../../services/token.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  hidePassword: boolean = true;
  passwordResetUrl: string = `${config.api.baseUrl}${config.api.users.passwordReset}`;

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]

  })

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private tokenService: TokenService,
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
          // Add token to local storage
          this.tokenService.setToken(response.body.token)

          this.toastr.success(`Welcome ${user.email}`);

          // Navigate to laboratory
          this.router.navigate(['/experiments']);
        }
      }
    });
  }

  /*** Internal functions ***/

  /* Form manipulation */

  // Getters
  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }
}
