import { Component, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSnackBarModule, MatIconModule],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss'
})
export class VehicleFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehicleService = inject(VehicleService);
  private snack = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  id = Number(this.route.snapshot.paramMap.get('id')) || null;
  loading = signal(false);

  form = this.fb.group({
    vehicle_reg_num: ['', Validators.required],
    vehicle_type: [''],
    status: ['active', Validators.required],
    fuel_category: ['DIESEL', Validators.required],
    regular_capacity: [0, [Validators.required, Validators.min(0)]],
    recycle_capacity: [0, [Validators.required, Validators.min(0)]],
    depreciation_thb: [0, [Validators.required, Validators.min(0)]],
    image_url: [''],
  });

  constructor() {
    if (this.isBrowser && this.id) {
      this.loading.set(true);
      this.vehicleService.get(this.id).subscribe({
        next: (res) => {
          const d = res.data;
          this.form.patchValue({
            vehicle_reg_num: d.registration_number || d.vehicle_reg_num || '', // Backend ใช้ registration_number
            vehicle_type: d.vehicle_type || '',
            status: d.status?.toUpperCase() || 'AVAILABLE', // แปลงเป็น uppercase สำหรับ form
            fuel_category: d.fuel_type?.toUpperCase() || 'DIESEL', // Backend ใช้ fuel_type
            regular_capacity: d.regular_waste_capacity_kg ?? d.regular_capacity ?? 0,
            recycle_capacity: d.recyclable_waste_capacity_kg ?? d.recycle_capacity ?? 0,
            depreciation_thb: d.depreciation_value_per_year ?? d.depreciation_thb ?? 0,
            image_url: d.image_url || '',
          });
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      console.log('❌ Form invalid:', this.form.errors);
      console.log('Form values:', this.form.value);
      return this.form.markAllAsTouched();
    }
    const raw = this.form.getRawValue();
    console.log('📝 Raw form values:', raw);
    
    // ========== Payload สำหรับ Server จริง (Backend) ==========
    // Backend ใช้ field names ต่างจาก frontend!
    const payload: any = {
      registration_number: raw.vehicle_reg_num || '',
      status: raw.status ?? 'active', // dropdown ส่งมาเป็น lowercase อยู่แล้ว
      fuel_type: (raw.fuel_category ?? 'diesel').toLowerCase(),
      regular_waste_capacity_kg: raw.regular_capacity ?? 0,
      recyclable_waste_capacity_kg: raw.recycle_capacity ?? 0,
      depreciation_value_per_year: raw.depreciation_thb ?? 0,
    };

    // เพิ่มเฉพาะฟิลด์ optional ที่มีค่า
    if (raw.vehicle_type) payload.vehicle_type = raw.vehicle_type;
    if (raw.image_url) payload.image_url = raw.image_url;

    console.log('📤 Sending payload:', payload);

    this.loading.set(true);
    const req = this.id
      ? this.vehicleService.update(this.id, payload)
      : this.vehicleService.create(payload);

    req.subscribe({
      next: (response) => {
        this.loading.set(false);
        console.log('✅ Save success:', response);
        this.snack.open('บันทึกสำเร็จ', 'ปิด', { duration: 2000 });
        this.router.navigate(['/vehicle']);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('❌ Save error:', err);
        
        let errorMsg = 'บันทึกล้มเหลว';
        if (err.error?.errors?.[0]?.message) {
          errorMsg = err.error.errors[0].message;
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        }
        
        this.snack.open(errorMsg, 'ปิด', { duration: 3000 });
      },
    });
  }

  cancel() {
    this.router.navigate(['/vehicle']);
  }
}
