// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private dialogRef: MatDialogRef<ProfileComponent>,
    private userService: UserService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.getUserData();
  }

  /*** HTML interaction functions ***/
  onSubmit(): void {
    if (this.profileForm.valid) {
      this.updateUser();
    } else {
      this.toastr.error(
        'Please, complete correctly the information.',
        'Invalid action'
      );
    }
  }


  /*** Service interaction functions ***/

  getUserData(): void {
    this.userService.getUserData().subscribe((user: User): void => {
      this.patchFormValues(user)
    });
  }

  updateUser(): void {
    const profileFormValue: any = this.profileForm.value;
    const user: User = {
      name: profileFormValue.name,
      last_name: profileFormValue.lastName,
      email: profileFormValue.email,
    };

    this.userService.updateUserData(user).subscribe((response: any): void => {
      if (response.status !== null && response.status === 200) {
        this.toastr.success('Successful update of user data');
        this.dialogRef.close();
      }
    });
  }

  /*** Internal functions ***/
  /* Form manipulation */
  patchFormValues(user: User): void {
    this.profileForm.patchValue({
      name: user.name,
      lastName: user.last_name,
      email: user.email,
    })
  }

  // Getters
  get nameControl() {
    return this.profileForm.get('name');
  }

  get lastNameControl() {
    return this.profileForm.get('lastName');
  }

  get emailControl() {
    return this.profileForm.get('email');
  }
}
