# คู่มือการสร้างหน้าใหม่ (New Page) ใน WasteRoute

คู่มือนี้จะอธิบายขั้นตอนการสร้างหน้าใหม่ในโปรเจกต์ WasteRoute แบบละเอียด เหมาะสำหรับผู้เริ่มต้น Angular

---

## ตัวอย่าง: สร้างหน้า "จุดเก็บขยะ" (Collection Points)

### ขั้นตอนที่ 1: สร้างโครงสร้างโฟลเดอร์และไฟล์

สร้างโฟลเดอร์และไฟล์ตามโครงสร้างนี้:

```
src/app/pages/collection-point/
├── collection-point-list/
│   ├── collection-point-list.page.component.ts
│   ├── collection-point-list.page.component.html
│   └── collection-point-list.page.component.scss
├── collection-point-form/
│   ├── collection-point-form.component.ts
│   ├── collection-point-form.component.html
│   └── collection-point-form.component.scss
└── collection-point-detail/
    ├── collection-point-detail.component.ts
    ├── collection-point-detail.component.html
    └── collection-point-detail.component.scss
```

**หมายเหตุ:**

- หน้าแสดงรายการใช้ `-list.page` เป็นส่วนท้ายของชื่อไฟล์
- หน้าฟอร์มและรายละเอียดใช้ `.component` ธรรมดา

---

### ขั้นตอนที่ 2: สร้างไฟล์ TypeScript (Component)

#### ตัวอย่าง: `collection-point-list.page.component.ts`

```typescript
import { Component, effect, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

@Component({
  selector: "app-collection-point-list-page",
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  templateUrl: "./collection-point-list.page.component.html",
  styleUrl: "./collection-point-list.page.component.scss",
})
export class CollectionPointListPageComponent {
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  loading = signal<boolean>(false);
  data = signal<any[]>([]);
  total = signal<number>(0);

  // ฟังก์ชันสำหรับดึงข้อมูล
  fetch() {
    this.loading.set(true);
    // TODO: เรียก service ดึงข้อมูลจาก API
    this.loading.set(false);
  }

  // ฟังก์ชันสำหรับสร้างรายการใหม่
  goCreate() {
    this.router.navigate(["/collection-point/new"]);
  }

  // ฟังก์ชันสำหรับแก้ไข
  goEdit(id: number) {
    this.router.navigate(["/collection-point", id, "edit"]);
  }

  // ฟังก์ชันสำหรับดูรายละเอียด
  view(id: number) {
    this.router.navigate(["/collection-point", id]);
  }

  // ฟังก์ชันสำหรับลบ
  delete(id: number) {
    if (!confirm("ต้องการลบจุดเก็บขยะนี้?")) return;
    // TODO: เรียก service ลบข้อมูล
    this.snack.open("ลบสำเร็จ", "ปิด", { duration: 2000 });
  }
}
```

**จุดสำคัญ:**

- ใช้ `standalone: true` (Angular แบบใหม่)
- import เฉพาะ Module ที่ใช้งานจริง
- ใช้ `signal()` สำหรับ state management
- ใช้ `inject()` แทน constructor injection

---

### ขั้นตอนที่ 3: สร้างไฟล์ HTML (Template)

#### ตัวอย่าง: `collection-point-list.page.component.html`

```html
<div class="collection-point-list">
  <div class="collection-point-list__header">
    <h1>รายชื่อจุดเก็บขยะ</h1>
    <button mat-raised-button color="primary" (click)="goCreate()">
      <mat-icon>add</mat-icon>
      เพิ่มจุดเก็บขยะ
    </button>
  </div>

  <div class="collection-point-list__content">
    @if (loading()) {
    <p>กำลังโหลด...</p>
    } @else {
    <table mat-table [dataSource]="data()">
      <!-- คอลัมน์ต่างๆ -->
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>รหัส</th>
        <td mat-cell *matCellDef="let row">{{ row.id }}</td>
      </ng-container>

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>ชื่อจุดเก็บขยะ</th>
        <td mat-cell *matCellDef="let row">{{ row.name }}</td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>จัดการ</th>
        <td mat-cell *matCellDef="let row">
          <button mat-icon-button (click)="view(row.id)">
            <mat-icon>visibility</mat-icon>
          </button>
          <button mat-icon-button (click)="goEdit(row.id)">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="delete(row.id)">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
    }
  </div>
</div>
```

**จุดสำคัญ:**

- ใช้ `@if` แทน `*ngIf` (Angular 17+)
- ใช้ `mat-table` สำหรับตาราง
- เรียกฟังก์ชันผ่าน `(click)="functionName()"`

---

### ขั้นตอนที่ 4: สร้างไฟล์ SCSS (Styles)

#### ตัวอย่าง: `collection-point-list.page.component.scss`

```scss
.collection-point-list {
  padding: 16px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      margin: 0;
      font-size: 24px;
    }
  }

  &__content {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
}
```

**จุดสำคัญ:**

- ใช้ BEM naming convention (ชื่อคลาส\_\_ส่วนย่อย)
- ใช้ `&__` สำหรับ nested selector

---

### ขั้นตอนที่ 5: สร้าง Model (ถ้าจำเป็น)

สร้างไฟล์ `src/app/core/models/collection-point.model.ts`

```typescript
export interface CollectionPoint {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: "general" | "recycle" | "hazardous";
  status: "active" | "inactive";
}
```

---

### ขั้นตอนที่ 6: สร้าง Service (ถ้าจำเป็น)

สร้างไฟล์ `src/app/core/services/collection-point.service.ts`

```typescript
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CollectionPoint } from "../models/collection-point.model";

@Injectable({
  providedIn: "root",
})
export class CollectionPointService {
  private http = inject(HttpClient);
  private apiUrl = "/api/collection-points";

  list(params?: any): Observable<{ data: CollectionPoint[]; total: number }> {
    return this.http.get<{ data: CollectionPoint[]; total: number }>(this.apiUrl, { params });
  }

  getById(id: number): Observable<CollectionPoint> {
    return this.http.get<CollectionPoint>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<CollectionPoint>): Observable<CollectionPoint> {
    return this.http.post<CollectionPoint>(this.apiUrl, data);
  }

  update(id: number, data: Partial<CollectionPoint>): Observable<CollectionPoint> {
    return this.http.put<CollectionPoint>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

---

### ขั้นตอนที่ 7: เพิ่ม Routes

แก้ไขไฟล์ `src/app/app.routes.ts`

```typescript
export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./pages/home/home.page.component").then((m) => m.HomePageComponent),
  },
  // ... routes เดิม ...

  // เพิ่ม routes ใหม่
  {
    path: "collection-point",
    loadComponent: () => import("./pages/collection-point/collection-point-list/collection-point-list.page.component").then((m) => m.CollectionPointListPageComponent),
  },
  {
    path: "collection-point/new",
    loadComponent: () => import("./pages/collection-point/collection-point-form/collection-point-form.component").then((m) => m.CollectionPointFormComponent),
  },
  {
    path: "collection-point/:id",
    loadComponent: () => import("./pages/collection-point/collection-point-detail/collection-point-detail.component").then((m) => m.CollectionPointDetailComponent),
  },
  {
    path: "collection-point/:id/edit",
    loadComponent: () => import("./pages/collection-point/collection-point-form/collection-point-form.component").then((m) => m.CollectionPointFormComponent),
  },
];
```

**จุดสำคัญ:**

- ใช้ `loadComponent` สำหรับ lazy loading
- เรียงลำดับ path จากเฉพาะเจาะจงไปทั่วไป (new ก่อน :id)

---

### ขั้นตอนที่ 8: เชื่อมโยงจากหน้า Home (ถ้าต้องการ)

แก้ไขไฟล์ `src/app/pages/home/home.page.component.ts`

```typescript
onCollectionPoints(): void {
  this.router.navigate(['/collection-point']);
}
```

---

## สรุป Checklist การสร้างหน้าใหม่

- [ ] สร้างโฟลเดอร์และไฟล์ component (`.ts`, `.html`, `.scss`)
- [ ] สร้าง Model interface ใน `src/app/core/models/`
- [ ] สร้าง Service ใน `src/app/core/services/`
- [ ] เพิ่ม Routes ใน `src/app/app.routes.ts`
- [ ] เชื่อมโยงการนำทางจากหน้าอื่น (ถ้าต้องการ)
- [ ] ทดสอบการทำงาน

---

## Tips สำหรับมือใหม่

1. **ตั้งชื่อไฟล์ให้ถูกต้อง:**

   - หน้าหลัก: `xxx-list.page.component.ts`
   - ฟอร์ม/รายละเอียด: `xxx-form.component.ts`

2. **ใช้ Angular Material:**

   - Import module ที่ต้องการใน `imports` array
   - ดู component ได้ที่: https://material.angular.io/components

3. **ใช้ Signals:**

   - `signal()` สำหรับ state ที่เปลี่ยนแปลงได้
   - เรียกใช้ด้วย `variableName()`
   - อัพเดทด้วย `variableName.set(newValue)`

4. **Route Parameters:**

   - ดึง ID จาก URL: `const id = this.route.snapshot.paramMap.get('id')`
   - ต้อง inject `ActivatedRoute` ก่อน

5. **ทดสอบ:**
   - รัน `npm run dev` เพื่อเปิด dev server
   - เปิดเว็บที่ `http://localhost:4200`

---

## ตัวอย่างโครงสร้างโปรเจกต์ทั้งหมด

```
src/app/
├── core/
│   ├── models/           # Interface/Type definitions
│   └── services/         # Business logic & API calls
├── pages/                # หน้าต่างๆ ของแอป
│   ├── home/
│   ├── staff/
│   ├── vehicle/
│   └── collection-point/  # หน้าใหม่
├── shared/               # Component ที่ใช้ร่วมกัน
│   └── navbar/
├── guards/               # Route guards
├── app.routes.ts         # Route configuration
└── app.component.ts      # Root component
```

---

**หมายเหตุ:** คู่มือนี้ใช้ Angular 17+ ที่รองรับ Standalone Components และ Signals
