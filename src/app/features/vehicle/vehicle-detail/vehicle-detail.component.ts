import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { VehicleService } from '../../../core/services/vehicle/vehicle.service';
import { Vehicle, FuelCategory, VehicleStatus } from '../../../shared/models/vehicle.model';
import { StaffService } from '../../../core/services/staff/staff.service';
import { DriverSelectDialogComponent, DriverSelectDialogData, DriverSelectDialogResult } from '../driver-select-dialog/driver-select-dialog.component';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehicleService = inject(VehicleService);
  private staffService = inject(StaffService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  loading = signal<boolean>(true);
  vehicle = signal<Vehicle | null>(null);
  driver = signal<any | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.isBrowser || !id) {
      this.loading.set(false);
      return;
    }

    this.vehicleService.get(id).subscribe({
      next: (res) => {
        const v = res.data;
        this.vehicle.set(v);
        const driverId = v.current_driver_id;
        if (driverId) {
          this.staffService.get(driverId).subscribe({
            next: (s) => {
              this.driver.set(s.data);
              this.loading.set(false);
            },
            error: () => this.loading.set(false),
          });
        } else {
          this.loading.set(false);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  back() { this.router.navigate(['/vehicle']); }

  editVehicle() {
    const id = this.vehicle()?.id;
    if (id) this.router.navigate(['/vehicle', id, 'edit']);
  }

  editDriver() {
    const v = this.vehicle();
    if (!v) return;

    const dialogData: DriverSelectDialogData = {
      currentDriverId: v.current_driver_id || null
    };

    const dialogRef = this.dialog.open(DriverSelectDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      panelClass: 'driver-select-dialog',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: DriverSelectDialogResult | undefined) => {
      if (!result || !result.selectedDriver) return;

      const newDriverId = result.selectedDriver.id;
      
      console.log('🔄 Updating vehicle driver:', { vehicleId: v.id, newDriverId });
      
      // Backend ต้องการฟิลด์หลักๆ ทั้งหมดเมื่อ update
      const updatePayload = {
        registration_number: v.registration_number || v.vehicle_reg_num,
        vehicle_type: v.vehicle_type,
        fuel_type: v.fuel_type || v.fuel_category,
        regular_waste_capacity_kg: v.regular_waste_capacity_kg || v.regular_capacity || 0,
        recyclable_waste_capacity_kg: v.recyclable_waste_capacity_kg || v.recycle_capacity || 0,
        depreciation_value_per_year: v.depreciation_value_per_year || v.depreciation_thb || 0,
        status: (v.status || 'active').toLowerCase(),
        current_driver_id: newDriverId
      };
      
      console.log('📤 Update payload:', updatePayload);
      
      // Update vehicle's current_driver_id
      this.vehicleService.update(v.id, updatePayload).subscribe({
        next: (res) => {
          console.log('✅ Driver updated successfully:', res);
          this.vehicle.set(res.data);
          this.driver.set(result.selectedDriver);
          this.snack.open('เปลี่ยนคนขับรถสำเร็จ', 'ปิด', { duration: 3000 });
        },
        error: (err) => {
          console.error('❌ Failed to update driver:', err);
          console.error('Error details:', {
            status: err.status,
            message: err.message,
            error: err.error,
            errors: err.error?.errors
          });
          
          // แสดง error messages จาก backend
          const errors = err.error?.errors || [];
          const errorMsg = errors.length > 0 
            ? errors.map((e: any) => e.message || e).join(', ') 
            : (err.error?.message || err.error?.error || 'เกิดข้อผิดพลาดในการเปลี่ยนคนขับรถ');
          
          this.snack.open(errorMsg, 'ปิด', { duration: 5000 });
        }
      });
    });
  }

  delete() {
    const v = this.vehicle();
    if (!v) return;
    const regNum = v.registration_number || v.vehicle_reg_num || 'ไม่ระบุ';
    if (!confirm(`ลบข้อมูลรถทะเบียน ${regNum}?`)) return;
    this.vehicleService.delete(v.id).subscribe({
      next: () => this.back(),
      error: () => {/* noop simple flow */},
    });
  }

  deactivate() {
    const v = this.vehicle();
    if (!v) return;
    const currentStatus = (v.status?.toUpperCase() || 'AVAILABLE') as VehicleStatus;
    const to = currentStatus === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    const label = to === 'MAINTENANCE' ? 'ปิดใช้งานรถคันนี้' : 'เปิดใช้งานรถคันนี้';
    if (!confirm(`${label}?`)) return;
    
    // ส่ง lowercase ให้ backend
    this.vehicleService.update(v.id, { status: to.toLowerCase() }).subscribe({
      next: (res) => this.vehicle.set(res.data),
      error: () => {/* noop */},
    });
  }

  // Display helpers
  vehicleCode(): string {
    const id = this.vehicle()?.id ?? 0;
    return 'VR-' + id.toString().padStart(6, '0');
  }

  // Helper methods สำหรับรองรับทั้ง backend field names และ frontend field names
  getRegNum(): string {
    const v = this.vehicle();
    return v?.registration_number || v?.vehicle_reg_num || '-';
  }

  getRegularCapacity(): number {
    const v = this.vehicle();
    return v?.regular_waste_capacity_kg ?? v?.regular_capacity ?? 0;
  }

  getRecycleCapacity(): number {
    const v = this.vehicle();
    return v?.recyclable_waste_capacity_kg ?? v?.recycle_capacity ?? 0;
  }

  getFuelType(): string {
    const v = this.vehicle();
    const fuel = v?.fuel_type || v?.fuel_category;
    return this.fuelLabel(fuel?.toUpperCase() as FuelCategory);
  }

  getDepreciation(): number {
    const v = this.vehicle();
    return v?.depreciation_value_per_year ?? v?.depreciation_thb ?? 0;
  }

  statusLabel(s: VehicleStatus | string | undefined): string {
    if (!s) return '-';
    const upper = s.toUpperCase();
    if (upper === 'AVAILABLE') return 'พร้อมใช้งาน';
    if (upper === 'IN_USE') return 'กำลังใช้งาน';
    if (upper === 'MAINTENANCE') return 'ซ่อมบำรุง';
    return '-';
  }

  fuelLabel(f: FuelCategory | string | undefined): string {
    if (!f) return '-';
    const upper = f.toUpperCase();
    if (upper === 'DIESEL') return 'ดีเซล (Diesel)';
    if (upper === 'GASOLINE') return 'เบนซิน (Gasoline)';
    return '-';
  }

  num(n?: number | null): string { return typeof n === 'number' ? new Intl.NumberFormat('th-TH').format(n) : '-'; }

  staffCodeFromId(id?: number | null): string {
    const num = typeof id === 'number' ? id : 0;
    return 'ST-' + num.toString().padStart(6, '0');
  }
}
