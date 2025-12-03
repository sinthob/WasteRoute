import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-daily-route',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-route.page.component.html',
  styleUrls: ['./daily-route.page.component.scss']
})
export class DailyRoutePageComponent {
  loading = false;
  response: any = null;
  error: string | null = null;

  // ข้อมูลทดสอบ
  private testData = {
    "_comment": "ตัวอย่าง Input แบบครบถ้วนสำหรับ VRP API - ใช้เป็น Reference สำหรับทดสอบการเชื่อมต่อจากเว็บไปยัง Docker",
    
    "distance_matrix": [
      [0,    5.3,  1.2,  3.4,  3.7,  2.8,  4.5],
      [5.3,  0,    5.0,  5.5,  3.8,  6.2,  4.1],
      [1.2,  5.0,  0,    3.0,  4.0,  2.5,  3.8],
      [3.4,  5.5,  3.0,  0,    4.7,  3.3,  2.9],
      [3.7,  3.8,  4.0,  4.7,  0,    5.1,  3.6],
      [2.8,  6.2,  2.5,  3.3,  5.1,  0,    4.2],
      [4.5,  4.1,  3.8,  2.9,  3.6,  4.2,  0]
    ],
    
    "demands": {
      "1": [2, 0],
      "2": [1, 3],
      "3": [0, 2],
      "4": [1, 1],
      "5": [2, 2],
      "6": [1, 2]
    },
    
    "vehicles": [
      {
        "name": "รถเล็ก-V",
        "fixed_cost": 1500,
        "h_capacity": 3,
        "k_capacity": 3,
        "fuel_cost_per_km": 2.5
      },
      {
        "name": "รถกลาง-W",
        "fixed_cost": 2500,
        "h_capacity": 5,
        "k_capacity": 5,
        "fuel_cost_per_km": 4.0
      },
      {
        "name": "รถใหญ่-X",
        "fixed_cost": 4000,
        "h_capacity": 8,
        "k_capacity": 8,
        "fuel_cost_per_km": 6.0
      }
    ],
    
    "required_end_sequence": [],
    
    "node_mapping": {
      "0": "Hub - ศูนย์กลางจัดเก็บขยะ",
      "1": "จุดเก็บขยะ A - ตลาดสด",
      "2": "จุดเก็บขยะ B - โรงเรียน",
      "3": "จุดเก็บขยะ C - ชุมชนบ้านเอื้ออาทร",
      "4": "จุดเก็บขยะ D - ห้างสรรพสินค้า",
      "5": "จุดเก็บขยะ E - โรงพยาบาล",
      "6": "จุดเก็บขยะ F - สำนักงานเทศบาล"
    },
    
    "_metadata": {
      "description": "ตัวอย่างข้อมูลครบถ้วนสำหรับทดสอบ VRP API",
      "total_nodes": 7,
      "waste_points": 6,
      "vehicle_types": 3,
      "notes": [
        "distance_matrix: ขนาด (n+1) x (n+1) โดย n = จำนวนจุดเก็บขยะ",
        "ดัชนี 0 = Hub (จุดเริ่มต้น/สิ้นสุด)",
        "ดัชนี 1-6 = จุดเก็บขยะ 6 จุด",
        "demands: [H, K] โดย H=ขยะทั่วไป, K=ขยะอันตราย",
        "required_end_sequence: ใส่ [] ถ้าไม่มี waypoint",
        "node_mapping: ชื่อจุดต่างๆ (optional แต่ช่วยให้อ่านผลลัพธ์ง่าย)"
      ]
    }
  };

  constructor(private http: HttpClient) {}

  testDockerConnection() {
    this.loading = true;
    this.response = null;
    this.error = null;

    const dockerUrl = 'http://localhost:5000/api/vrp/solve';

    this.http.post(dockerUrl, this.testData).subscribe({
      next: (data) => {
        this.loading = false;
        this.response = data;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'ไม่สามารถเชื่อมต่อกับ Docker ได้';
        console.error('Error:', err);
      }
    });
  }
}
