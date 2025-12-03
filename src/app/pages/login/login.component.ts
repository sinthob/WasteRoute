import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>🗑️ WasteRoute</h1>
        <h2>เข้าสู่ระบบ</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email"
              type="email" 
              formControlName="email" 
              placeholder="admin@waste.com"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            <div class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              กรุณาใส่ email ที่ถูกต้อง
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              id="password"
              type="password" 
              formControlName="password" 
              placeholder="••••••••"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              กรุณาใส่รหัสผ่าน
            </div>
          </div>
          
          <button 
            type="submit" 
            [disabled]="!loginForm.valid || loading"
            class="btn-login"
          >
            <span *ngIf="!loading">เข้าสู่ระบบ</span>
            <span *ngIf="loading">กำลังเข้าสู่ระบบ...</span>
          </button>
          
          <div class="error-box" *ngIf="errorMessage">
            ❌ {{ errorMessage }}
          </div>
        </form>

        <div class="hint">
          <small>💡 ใช้ email และ password ที่ได้รับจากผู้ดูแลระบบ</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      color: #667eea;
      margin: 0 0 10px 0;
      font-size: 2.5rem;
    }

    h2 {
      text-align: center;
      color: #333;
      margin: 0 0 30px 0;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
      font-size: 0.9rem;
    }

    input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    input.error {
      border-color: #f44336;
    }

    .error-message {
      color: #f44336;
      font-size: 0.85rem;
      margin-top: 5px;
    }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-box {
      background: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 8px;
      margin-top: 20px;
      text-align: center;
      border: 1px solid #ef9a9a;
    }

    .hint {
      margin-top: 20px;
      text-align: center;
      color: #757575;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 30px 20px;
      }

      h1 {
        font-size: 2rem;
      }

      h2 {
        font-size: 1.25rem;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]]
    });

    // ถ้า login แล้ว redirect ไปหน้าหลัก
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('✅ Login success:', response);
          this.loading = false;
          // ไปหน้าหลักหลัง login สำเร็จ
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('❌ Login error:', error);
          this.loading = false;
          
          // แสดง error message
          if (error.error?.errors?.[0]?.message) {
            this.errorMessage = error.error.errors[0].message;
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง';
          }
        }
      });
    } else {
      // Mark all fields as touched เพื่อแสดง error
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
