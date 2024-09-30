import { AuthService } from '../../auth/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-code-activation',
  templateUrl: './code-activation.component.html',
  styleUrls: ['./code-activation.component.css']
})
export class CodeActivationComponent implements OnInit {
  activationStatus: boolean = false;
  userId!: number;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem("userId"))
  }

  handleKeyDown(e: any): void {
    const KEYBOARDS = {
      backspace: 8, arrowLeft: 37,
      arrowRight: 39,
    };

    switch (e.keyCode) {
      case KEYBOARDS.backspace:
        this.handleBackspace(e);
        break;
      case KEYBOARDS.arrowLeft:
        this.handleArrowLeft(e); break;
      case KEYBOARDS.arrowRight:
        this.handleArrowRight(e);
        break;
      default:
    }
  }

  handleInput(e: any): void {
    const input = e.target;
    const nextInput = input.nextElementSibling;
    if (nextInput && input.value) {
      nextInput.focus();
      if (nextInput.value) {
        nextInput.select();
      }
    }
  }

  handlePaste(e: ClipboardEvent): void {
    var inputs = document.querySelectorAll('input');
    e.preventDefault();
    const paste = e.clipboardData!.getData('text');
    inputs.forEach((input, i) => {
      input.value = paste[i] || '';
    });
  }

  handleBackspace(e: any): void {
    const input = e.target;
    if (input.value) {
      input.value = '';
      return;
    }
    if (input.previousElementSibling) {
      input.previousElementSibling.focus();
    }
  }

  handleArrowLeft(e: any): void {
    const previousInput = e.target.previousElementSibling;
    if (!previousInput) return;
    previousInput.focus();
  }

  handleArrowRight(e: any): void {
    const nextInput = e.target.nextElementSibling; if (!nextInput) return;
    nextInput.focus();
  }

  resendCode(): void {
    this.authService.requestVerificationCode(this.userId).subscribe({
      next: () => {
        this.toastr.success(
          'Please check your email for a new verification code.'
        );
      },
      error: () => {
        this.toastr.error(
          'Unable to resend the verification code.'
        );
      },
    });
  }

  sendCode(): void {
    const form = document.querySelector('form');
    const inputs = form?.querySelectorAll('input');
    var valueCode = '';
    inputs!.forEach((input) => {
      valueCode = valueCode + input.value;
    });

    if (valueCode.length === 6 && /^\d+$/.test(valueCode) && this.userId) {
      var params = {
        id: this.userId,
        verification_code: valueCode,
      };

      this.authService.activateAccount(params).subscribe({
        next: (response) => {
          this.toastr.success(
            'Your account has been successfully activated.'
          );
          this.activationStatus = true;
          localStorage.removeItem('userId');

          setTimeout((): void => {
            this.router.navigate([''])
          }, 2000);
        },
        error: (e): void => {
          this.toastr.error('The verification code is invalid.');
          this.activationStatus = false;
        },
      });
    }
    else {
      this.toastr.error('Verification code format is incorrect.');
    }

  }
}
