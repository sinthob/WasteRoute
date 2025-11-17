import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleFormComponent {

}
