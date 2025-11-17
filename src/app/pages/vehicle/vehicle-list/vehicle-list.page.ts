import { Component, ChangeDetectionStrategy, effect, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
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
  search = signal<string>('');
  status = signal<string>(''); // AVAILABLE | IN_USE | MAINTENANCE | ''
  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);

  displayedColumns = ['reg', 'regular', 'recycle', 'fuel', 'status', 'actions'];

  constructor() {
    if (this.isBrowser) {
      effect(() => {
        this.fetch();
      });
    }
  }

  onSearchChange(value: string) {
    this.pageIndex.set(0);
    this.search.set(value);
    this.fetch();
  }

  onStatusChange(value: string) {
    this.pageIndex.set(0);
    this.status.set(value);
    this.fetch();
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

    this.vehicleService
      .list({
        search: this.search(),
        status: this.status(),
        page: this.pageIndex() + 1,
        limit: this.pageSize(),
      })
      .subscribe({
        next: (res) => {
          this.data.set(res.data || []);
          this.total.set(res.total ?? res.data?.length ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('โหลดข้อมูลรถล้มเหลว');
          this.snack.open('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'ปิด', { duration: 3000 });
        },
      });
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

  statusLabel(s: VehicleStatus | ''): string {
    if (s === 'AVAILABLE') return 'พร้อมใช้งาน';
    if (s === 'IN_USE') return 'กำลังใช้งาน';
    if (s === 'MAINTENANCE') return 'ซ่อมบำรุง';
    return '-';
  }
}