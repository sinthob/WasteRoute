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

import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle, FuelCategory, VehicleStatus } from '../../../core/models/vehicle.model';
import { StaffService } from '../../../core/services/staff.service';

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
    const id = this.vehicle()?.current_driver_id;
    if (id) this.router.navigate(['/staff', id, 'edit']);
  }

  delete() {
    const v = this.vehicle();
    if (!v) return;
    if (!confirm(`ลบข้อมูลรถทะเบียน ${v.vehicle_reg_num}?`)) return;
    this.vehicleService.delete(v.id).subscribe({
      next: () => this.back(),
      error: () => {/* noop simple flow */},
    });
  }

  deactivate() {
    const v = this.vehicle();
    if (!v) return;
    const to = v.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    const label = to === 'MAINTENANCE' ? 'ปิดใช้งานรถคันนี้' : 'เปิดใช้งานรถคันนี้';
    if (!confirm(`${label}?`)) return;
    this.vehicleService.update(v.id, { status: to as VehicleStatus }).subscribe({
      next: (res) => this.vehicle.set(res.data),
      error: () => {/* noop */},
    });
  }

  // Display helpers
  vehicleCode(): string {
    const id = this.vehicle()?.id ?? 0;
    return 'VR-' + id.toString().padStart(6, '0');
  }

  statusLabel(s: VehicleStatus | undefined): string {
    if (s === 'AVAILABLE') return 'พร้อมใช้งาน';
    if (s === 'IN_USE') return 'กำลังใช้งาน';
    if (s === 'MAINTENANCE') return 'ซ่อมบำรุง';
    return '-';
  }

  fuelLabel(f: FuelCategory | undefined): string {
    if (f === 'DIESEL') return 'ดีเซล (Diesel)';
    if (f === 'GASOLINE') return 'เบนซิน (Gasoline)';
    return '-';
  }

  num(n?: number | null): string { return typeof n === 'number' ? new Intl.NumberFormat('th-TH').format(n) : '-'; }

  staffCodeFromId(id?: number | null): string {
    const num = typeof id === 'number' ? id : 0;
    return 'ST-' + num.toString().padStart(6, '0');
  }
}
