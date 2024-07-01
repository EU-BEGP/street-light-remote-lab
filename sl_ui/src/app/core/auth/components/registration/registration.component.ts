import { Component, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormControl,
  FormGroupDirective,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  hidePassword: boolean = true;
  hidePasswordConfirmation: boolean = true;

  registrationForm = new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required]),
    lastName: new UntypedFormControl('', [Validators.required]),
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [
      Validators.minLength(8),
      Validators.required,
      this.matchValidator('passwordConfirmation', true),
    ]),
    passwordConfirmation: new UntypedFormControl('', [
      Validators.required,
      this.matchValidator('password'),
    ]),
  });

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void { }

  matchValidator(matchTo: string, reverse?: boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.parent && reverse) {
        const c = (control.parent?.controls as any)[matchTo] as AbstractControl;
        if (c) {
          c.updateValueAndValidity();
        }
        return null;
      }
      return !!control.parent &&
        !!control.parent.value &&
        control.value === (control.parent?.controls as any)[matchTo].value
        ? null
        : { notSame: true };
    };
  }

  get passwordControl() {
    return this.registrationForm.controls['password'];
  }

  get passwordConfirmationControl() {
    return this.registrationForm.controls['passwordConfirmation'];
  }

  saveUser(formDirective: FormGroupDirective): void {
    if (this.registrationForm.valid) {
      const user: User = {
        name: this.registrationForm.controls['name'].value,
        last_name: this.registrationForm.controls['lastName'].value,
        email: this.registrationForm.controls['email'].value,
        password: this.passwordControl.value,
      };

      this.authService.signUp(user).subscribe((response) => {
        if (response.status !== null && response.status === 201) {
          this.toastr.success(
            `Welcome ${user.name}`,
            'Successful registration',
          );
          setTimeout(() => {
            this.router.navigate(['/activate']);
          }, 2000);
        }
      });
    } else {
      this.toastr.error(
        'Please, complete correctly the information.',
        'Invalid action'
      );
    }
  }

  isPasswordConfirmationValid(): boolean {
    return (
      this.passwordConfirmationControl.errors !== null &&
      this.passwordConfirmationControl.errors['notSame']
    );
  }

  getPasswordControlError(): string {
    return (
      this.passwordControl.errors != null &&
      this.passwordControl.errors['minlength']
    );
  }

  checkReturnUrl() {
    let params = new URLSearchParams(document.location.search);
    let returnUrl = params.get('return-url');

    if (returnUrl) this.router.navigateByUrl(returnUrl);
    else {
      this.router.navigateByUrl('');
    }
  }
}
