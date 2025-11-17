import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'staff',
	},
	{
		path: 'staff',
		loadComponent: () =>
				import('./pages/staff/staff-list/staff-list.page.component').then(
					(m) => m.StaffListPageComponent,
			),
	},
	{
		path: 'staff/new',
		loadComponent: () =>
				import('./pages/staff/staff-form/staff-form.component').then(
				(m) => m.StaffFormPageComponent,
			),
	},
	{
		path: 'staff/:id',
		loadComponent: () =>
				import('./pages/staff/staff-detail/staff-detail.component').then(
				(m) => m.StaffDetailPageComponent,
			),
	},
	{
		path: 'staff/:id/edit',
		canDeactivate: [() => import('./guards/pending-changes.guard').then(m => m.PendingChangesGuard)],
		loadComponent: () =>
				import('./pages/staff/staff-form/staff-form.component').then(
				(m) => m.StaffFormPageComponent,
			),
	},
    {
        path: 'vehicle',
        loadComponent: () =>
            import('./pages/vehicle/vehicle-list/vehicle-list.page').then(m => m.VehicleListPage),
    }
	,
	{
		path: 'vehicle/new',
		loadComponent: () =>
			import('./pages/vehicle/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent),
	},
	{
		path: 'vehicle/:id',
		loadComponent: () =>
			import('./pages/vehicle/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent),
	},
	{
		path: 'vehicle/:id/edit',
		loadComponent: () =>
			import('./pages/vehicle/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent),
	}
];
