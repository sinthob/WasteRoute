import { Component, ChangeDetectionStrategy, effect, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle, VehicleStatus } from '../../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicle-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './vehicle-list.page.html',
  styleUrl: './vehicle-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleListPage {
  private vehicleService = inject(VehicleService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  data = signal<Vehicle[]>([]);
  total = signal<number>(0);

  // filters
  searchReg = '';
  searchDriver = '';
  status = '';
  fuelCategory = '';
  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);

  displayedColumns = ['reg', 'driver', 'regular', 'recycle', 'fuel', 'status', 'actions'];

  constructor() {
    if (this.isBrowser) {
      this.fetch();
    }
  }

  onPageChange(evt: PageEvent) {
    this.pageIndex.set(evt.pageIndex);
    this.pageSize.set(evt.pageSize);
    this.fetch();
  }

  fetch() {
    if (!this.isBrowser) return;
    this.loading.set(true);
    this.error.set(null);

    // ========== ใช้ข้อมูลจาก Server จริง (Backend) ==========
    this.vehicleService
      .list({
        search: this.searchReg,
        driver: this.searchDriver,
        status: this.status,
        fuel: this.fuelCategory,
        page: this.pageIndex() + 1,
        per_page: this.pageSize(), // ใช้ per_page สำหรับ server จริง
      })
      .subscribe({
        next: (res: any) => {
          console.log('📥 Vehicle list response:', res);
          // Server ส่ง: {success: true, data: {pagination: {...}, vehicles: [...]}}
          const vehicles = res.data?.vehicles || [];
          const total = res.data?.pagination?.total || vehicles.length;
          this.data.set(vehicles);
          this.total.set(total);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set('โหลดข้อมูลรถล้มเหลว');
          this.snack.open('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'ปิด', { duration: 3000 });
          console.error('Error loading vehicles:', err);
        },
      });

    // ========== ใช้ข้อมูลจาก Mock Server (เก็บไว้เป็น reference) ==========
    // this.vehicleService
    //   .list({
    //     search: this.searchReg,
    //     driver: this.searchDriver,
    //     status: this.status,
    //     fuel: this.fuelCategory,
    //     page: this.pageIndex() + 1,
    //     limit: this.pageSize(), // ใช้ limit สำหรับ mock server
    //   })
    //   .subscribe({
    //     next: (res) => {
    //       this.data.set(res.data || []);
    //       this.total.set(res.total ?? res.data?.length ?? 0);
    //       this.loading.set(false);
    //     },
    //     error: () => {
    //       this.loading.set(false);
    //       this.error.set('โหลดข้อมูลรถล้มเหลว');
    //       this.snack.open('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'ปิด', { duration: 3000 });
    //     },
    //   });
  }

  goCreate() {
    this.router.navigate(['/vehicle/new']);
  }

  view(row: Vehicle) {
    this.router.navigate(['/vehicle', row.id]);
  }

  delete(row: Vehicle) {
    if (!confirm(`ลบรถทะเบียน ${row.vehicle_reg_num}?`)) return;
    this.vehicleService.delete(row.id).subscribe({
      next: () => {
        this.snack.open('ลบสำเร็จ', 'ปิด', { duration: 2000 });
        this.fetch();
      },
      error: () => this.snack.open('ลบไม่สำเร็จ', 'ปิด', { duration: 2000 }),
    });
  }

  statusLabel(s: VehicleStatus | string | ''): string {
    const statusUpper = (s || '').toUpperCase();
    if (statusUpper === 'AVAILABLE') return 'พร้อมใช้งาน';
    if (statusUpper === 'IN_USE') return 'กำลังใช้งาน';
    if (statusUpper === 'MAINTENANCE') return 'ซ่อมบำรุง';
    return '-';
  }
}