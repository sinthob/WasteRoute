import { Component } from '@angular/core';


@Component({
  selector: 'app-daily-route',
  standalone: true,
  imports: [],
  templateUrl: './daily-route.page.component.html',
  styleUrls: ['./daily-route.page.component.scss']
})
export class DailyRoutePageComponent {
  // Placeholder data for UI mockup
  mockRoutes = [
    {
      id: 'กข 1234',
      driver: 'นาย สินธพ กอซิซลีล่า',
      fullCapacity: '2000 ลิตร',
      currentCapacity: '1500 ลิตร',
      distance: '24 กิโลเมตร',
      cost: '2000 บาท',
      status: 'รับละเอียด'
    },
    {
      id: 'กข 1234',
      driver: 'นาย สินธพ กอซิซลีล่า',
      fullCapacity: '2000 ลิตร',
      currentCapacity: '1500 ลิตร',
      distance: '24 กิโลเมตร',
      cost: '2000 บาท',
      status: 'รับละเอียด'
    },
    {
      id: 'กข 1234',
      driver: 'นาย สินธพ กอซิซลีล่า',
      fullCapacity: '2000 ลิตร',
      currentCapacity: '1500 ลิตร',
      distance: '24 กิโลเมตร',
      cost: '2000 บาท',
      status: 'รับละเอียด'
    }
  ];

  currentPage = 1;
  itemsPerPage = 3;
  totalItems = 3;
}
