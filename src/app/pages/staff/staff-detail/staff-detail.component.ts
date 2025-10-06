import { Component, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StaffService } from '../../../core/services/staff.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-staff-detail-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, RouterLink],
  templateUrl: './staff-detail.component.html',
  styleUrls: ['./staff-detail.component.scss']
})
export class StaffDetailPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private staffService = inject(StaffService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  loading = signal(true);
  staff = signal<any>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.isBrowser && id) {
      this.staffService.get(id).subscribe({
        next: (res) => {
          this.staff.set(res.data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.loading.set(false);
    }
  }

  back() { this.router.navigate(['/staff']); }

  // Display helpers (formatting only)
  staffCode(): string {
    const s = this.staff();
    const num = typeof s?.id === 'number' ? s!.id : 0;
    return 'ST-' + num.toString().padStart(6, '0');
  }

  roleLabel(): string {
    const r = this.staff()?.role;
    if (r === 'DRIVER') return 'พนักงานขับรถ';
    if (r === 'COLLECTOR') return 'พนักงานเก็บขยะ';
    if (r === 'ADMIN') return 'พนักงานวางเเผนเส้นทาง';
    return '-';
  }
}
