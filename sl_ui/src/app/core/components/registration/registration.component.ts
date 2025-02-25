import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/features/services/storage.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  hidePassword: boolean = true;
  hidePasswordConfirmation: boolean = true;

  registrationForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8)
    ]],
    passwordConfirmation: ['', [
      Validators.required
    ]],
  }, { validators: this.matchPasswordValidator('password', 'passwordConfirmation') });

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private storageService: StorageService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void { }

  /*** HTML interaction functions ***/

  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.registerUser();
    } else {
      this.toastr.error(
        'Please, complete correctly the information.',
        'Invalid action'
      );
    }
  }

  /*** Service interaction functions ***/

  registerUser(): void {
    const registrationFormValue: any = this.registrationForm.value;
    const user: User = {
      name: registrationFormValue.name,
      last_name: registrationFormValue.lastName,
      email: registrationFormValue.email,
      password: registrationFormValue.password
    }

    this.authService.signUp(user).subscribe((response) => {
      if (response.status !== null && response.status === 201) {
        this.storageService.setUserId(response.body.id)

        this.toastr.success(
          `Welcome ${user.name}`,
          'Successful registration',
        );

        setTimeout((): void => {
          this.router.navigate(['/account-activation'])
        }, 2000);
      }
    });
  }

  /*** Internal functions ***/

  /* Form manipulation */

  // Getters
  get nameControl() {
    return this.registrationForm.get('name');
  }

  get lastNameControl() {
    return this.registrationForm.get('lastName');
  }

  get emailControl() {
    return this.registrationForm.get('email');
  }

  get passwordControl() {
    return this.registrationForm.get('password');
  }

  get passwordConfirmationControl() {
    return this.registrationForm.get('passwordConfirmation');
  }

  /* Custom Validator */
  matchPasswordValidator(passwordKey: string, passwordConfirmationKey: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const passwordControl = formGroup.get(passwordKey);
      const passwordConfirmationControl = formGroup.get(passwordConfirmationKey);

      if (!passwordControl || !passwordConfirmationControl) {
        return null; // Return null if controls are not found
      }

      if (passwordControl.value !== passwordConfirmationControl.value) {
        return { passwordsMismatch: true }; // Return an error object if passwords do not match
      }

      return null; // Return null if passwords match
    };
  }
}
