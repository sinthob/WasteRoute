import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: any;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = '/api/v1/auth';

  /**
   * Login และเก็บ token
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data.token) {
            // เก็บ token ไว้ใน localStorage
            localStorage.setItem('auth_token', response.data.token);
            
            // เก็บข้อมูล user (ถ้ามี)
            if (response.data.user) {
              localStorage.setItem('user', JSON.stringify(response.data.user));
            }
          }
        })
      );
  }

  /**
   * Logout และลบ token
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  /**
   * ดึง token ที่เก็บไว้
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * ตรวจสอบว่า login แล้วหรือยัง
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * ดึงข้อมูล user ที่ login อยู่
   */
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
