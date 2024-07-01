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
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.css'],
})
export class ProfileFormComponent implements OnInit {
  hidePassword: boolean = true;
  hidePasswordConfirmation: boolean = true;

  hideActualPassword: boolean = true;
  changePwd: boolean = false;

  registeredPassword: string | undefined = '';

  editionForm = new UntypedFormGroup({
    name: new UntypedFormControl('', [Validators.required]),
    lastName: new UntypedFormControl('', [Validators.required]),
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
  });

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getUserData();
  }
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
    return this.editionForm.controls['password'];
  }

  get passwordConfirmationControl() {
    return this.editionForm.controls['passwordConfirmation'];
  }

  getUserData() {
    this.userService.getUserData().subscribe((response) => {
      this.editionForm.controls['name'].setValue(response.name);
      this.editionForm.controls['lastName'].setValue(response.last_name);
      this.editionForm.controls['email'].setValue(response.email);
    });
  }
  updateUser(formDirective: FormGroupDirective): void {
    if (this.editionForm.valid) {
      const user: User = {
        name: this.editionForm.controls['name'].value,
        last_name: this.editionForm.controls['lastName'].value,
        email: this.editionForm.controls['email'].value,
      };

      this.userService.updateUserData(user).subscribe((response) => {
        if (response.status !== null && response.status === 200) {
          this.toastr.success('Successful update of user data');
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

  changePasswordRequest() {
    if (
      this.editionForm.controls['actualPassword'].value ==
      this.registeredPassword
    ) {
      this.changePwd = true;
    } else {
      this.toastr.error(
        'Please, enter your actual password.',
        'Invalid password.'
      );
    }
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
