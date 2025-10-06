import { Component, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffService } from '../../../core/services/staff.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-staff-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSnackBarModule, MatIconModule],
  templateUrl: './staff-form.component.html',
  styleUrls: ['./staff-form.component.scss']
})
export class StaffFormPageComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private staffService = inject(StaffService);
  private snack = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  id = Number(this.route.snapshot.paramMap.get('id')) || null;
  isEdit = this.route.snapshot.routeConfig?.path?.includes('edit') || false;
  loading = signal(false);

  form = this.fb.group({
    prefix: ['นาย', Validators.required],
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['DRIVER', Validators.required],
    status: ['ACTIVE'],
    phone_number: [''],
    s_image: [''], // โปรไฟล์รูปภาพ (URL/Base64)
  });

  constructor() {
    if (this.isBrowser && this.id) {
      this.loading.set(true);
      this.staffService.get(this.id).subscribe({
        next: (res) => {
          const d = res.data;
          this.form.patchValue({
            prefix: d.prefix,
            firstname: d.firstname,
            lastname: d.lastname,
            email: d.email,
            role: d.role,
            status: d.status || 'ACTIVE',
            phone_number: d.phone_number || '',
            s_image: d.s_image || '',
          });
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  submit() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const raw = this.form.getRawValue();
    const payload = {
      prefix: raw.prefix ?? '',
      firstname: raw.firstname ?? '',
      lastname: raw.lastname ?? '',
      email: raw.email ?? '',
      password: raw.password ?? '',
      role: (raw.role ?? 'DRIVER') as any,
      status: (raw.status ?? 'ACTIVE') as any,
      phone_number: raw.phone_number ?? '',
      s_image: raw.s_image ?? '',
    };

    this.loading.set(true);
    const req = this.id
      ? this.staffService.update(this.id, payload)
      : this.staffService.create(payload);

    req.subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open('บันทึกสำเร็จ', 'ปิด', { duration: 2000 });
        this.router.navigate(['/staff']);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('บันทึกล้มเหลว', 'ปิด', { duration: 2500 });
      },
    });
  }

  cancel() {
    this.router.navigate(['/staff']);
  }

  // Used by CanDeactivate guard to warn on unsaved changes
  hasPendingChanges(): boolean {
    return this.form.dirty;
  }

  // Display helper for read-only employee code shown in the form header field
  staffCode(): string {
    const id = this.id;
    const num = typeof id === 'number' ? id : 0;
    return 'ST-' + num.toString().padStart(6, '0');
  }

  // ----- Image handlers (เฉพาะส่วนโปรไฟล์รูปภาพ) -----
  onImageFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    // แปลงเป็น data URL เพื่อแสดงผลทันที และส่งไป backend ง่ายๆ
    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ s_image: reader.result as string });
      this.form.markAsDirty();
    };
    reader.readAsDataURL(file);
    // reset ค่าเดิมของ input เพื่อให้เลือกไฟล์เดิมซ้ำได้
    input.value = '';
  }

  removeImage() {
    this.form.patchValue({ s_image: '' });
    this.form.markAsDirty();
  }
}
