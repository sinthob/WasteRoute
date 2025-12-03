import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { StaffService } from '../../../core/services/staff.service';
import { Staff, StaffRole } from '../../../core/models/staff.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-staff-list-page',
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
  templateUrl: './staff-list.page.component.html',
  styleUrl: './staff-list.page.component.scss'
})
export class StaffListPageComponent {
  private staffService = inject(StaffService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  data = signal<Staff[]>([]);
  total = signal<number>(0);

  // filters
  search = signal<string>('');
  role = signal<string>('');
  status = signal<string>('');
  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);

  displayedColumns = ['prefix', 'firstname', 'lastname', 'role', 'phone', 'actions'];

  constructor() {
    if (this.isBrowser) {
      effect(() => {
        // Effect จะเรียก fetch() อัตโนมัติเมื่อ signal ใดๆ เปลี่ยน
        this.search();
        this.role();
        this.status();
        this.pageIndex();
        this.pageSize();
        this.fetch();
      });
    }
  }

  onSearchChange(value: string) {
    this.pageIndex.set(0);
    this.search.set(value);
    // ไม่ต้องเรียก fetch() เพราะ effect จะทำให้
  }

  onRoleChange(value: string) {
    this.pageIndex.set(0);
    this.role.set(value);
    // ไม่ต้องเรียก fetch() เพราะ effect จะทำให้
  }

  onStatusChange(value: string) {
    this.pageIndex.set(0);
    this.status.set(value);
    // ไม่ต้องเรียก fetch() เพราะ effect จะทำให้
  }

  onPageChange(evt: PageEvent) {
    this.pageIndex.set(evt.pageIndex);
    this.pageSize.set(evt.pageSize);
    // ไม่ต้องเรียก fetch() เพราะ effect จะทำให้
  }

  fetch() {
  if (!this.isBrowser) return;
  this.loading.set(true);
    this.error.set(null);

    // ========== ใช้ข้อมูลจาก Server จริง (Backend) ==========
    const params = {
      search: this.search(),
      role: this.role() ? this.role().toLowerCase() : '', // แปลงเป็น lowercase สำหรับ server
      status: this.status() ? this.status().toLowerCase() : '', // แปลงเป็น lowercase สำหรับ server
      page: this.pageIndex() + 1,
      per_page: this.pageSize(), // ใช้ per_page สำหรับ server จริง
    };
    
    console.log('🔍 Sending filter params to server:', params);
    
    this.staffService
      .list(params)
      .subscribe({
        next: (res: any) => {
          console.log('📥 Staff list response:', res);
          // Server ส่ง: {success: true, data: {pagination: {...}, staffs: [...]}}
          const staffs = res.data?.staffs || [];
          const total = res.data?.pagination?.total || staffs.length;
          this.data.set(staffs);
          this.total.set(total);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set('โหลดข้อมูลล้มเหลว');
          this.snack.open('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'ปิด', { duration: 3000 });
          console.error('Error loading staff:', err);
        },
      });

    // ========== ใช้ข้อมูลจาก Mock Server (เก็บไว้เป็น reference) ==========
    // this.staffService
    //   .list({
    //     search: this.search(),
    //     role: this.role(),
    //     status: this.status(),
    //     page: this.pageIndex() + 1,
    //     limit: this.pageSize(), // ใช้ limit สำหรับ mock server
    //   })
    //   .subscribe({
    //     next: (res) => {
    //       this.data.set(res.data || []);
    //       this.total.set(res.total ?? res.data?.length ?? 0);
    //       this.loading.set(false);
    //     },
    //     error: (err) => {
    //       this.loading.set(false);
    //       this.error.set('โหลดข้อมูลล้มเหลว');
    //       this.snack.open('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'ปิด', { duration: 3000 });
    //     },
    //   });
  }

  goCreate() {
    this.router.navigate(['/staff/new']);
  }

  goEdit(row: Staff) {
    this.router.navigate(['/staff', row.id, 'edit']);
  }

  view(row: Staff) {
    this.router.navigate(['/staff', row.id]);
  }

  delete(row: Staff) {
    if (!confirm(`ลบพนักงาน ${row.firstname} ${row.lastname}?`)) return;
    this.staffService.delete(row.id).subscribe({
      next: () => {
        this.snack.open('ลบสำเร็จ', 'ปิด', { duration: 2000 });
        this.fetch();
      },
      error: () => this.snack.open('ลบไม่สำเร็จ', 'ปิด', { duration: 2000 }),
    });
  }

  // mapping role code to Thai label for table display
  roleLabel(role: StaffRole | string | ''): string {
    const roleUpper = (role || '').toUpperCase();
    if (roleUpper === 'DRIVER') return 'พนักงานขับรถ';
    if (roleUpper === 'COLLECTOR') return 'พนักงานเก็บขยะ';
    if (roleUpper === 'ADMIN') return 'พนักงานวางเเผนเส้นทาง';
    return '-';
  }
}
