import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
	{
		path: 'login',
		loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
	},
	{
		path: '',
		canActivate: [AuthGuard],
		loadComponent: () => import('./pages/home/home.page.component').then(m => m.HomePageComponent),
	},
	{
		path: 'staff',
		canActivate: [AuthGuard],
		loadComponent: () =>
				import('./pages/staff/staff-list/staff-list.page.component').then(
					(m) => m.StaffListPageComponent,
			),
	},
	{
		path: 'staff/new',
		canActivate: [AuthGuard],
		loadComponent: () =>
				import('./pages/staff/staff-form/staff-form.component').then(
				(m) => m.StaffFormPageComponent,
			),
	},
	{
		path: 'staff/:id',
		canActivate: [AuthGuard],
		loadComponent: () =>
				import('./pages/staff/staff-detail/staff-detail.component').then(
				(m) => m.StaffDetailPageComponent,
			),
	},
	{
		path: 'staff/:id/edit',
		canActivate: [AuthGuard],
		canDeactivate: [() => import('./guards/pending-changes.guard').then(m => m.PendingChangesGuard)],
		loadComponent: () =>
				import('./pages/staff/staff-form/staff-form.component').then(
				(m) => m.StaffFormPageComponent,
			),
	},
    {
        path: 'vehicle',
		canActivate: [AuthGuard],
        loadComponent: () =>
            import('./pages/vehicle/vehicle-list/vehicle-list.page').then(m => m.VehicleListPage),
    }
	,
	{
		path: 'vehicle/new',
		canActivate: [AuthGuard],
		loadComponent: () =>
			import('./pages/vehicle/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent),
	},
	{
		path: 'vehicle/:id',
		canActivate: [AuthGuard],
		loadComponent: () =>
			import('./pages/vehicle/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent),
	},
	{
		path: 'vehicle/:id/edit',
		canActivate: [AuthGuard],
		loadComponent: () =>
			import('./pages/vehicle/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent),
	},
	{
		path: 'collection-point',
		canActivate: [AuthGuard],
		loadComponent: () =>
			import('./pages/collection-point/collection-point-list/collection-point-list.page.component').then(m => m.CollectionPointListPageComponent),
	},
	{
		path: 'collection-point/new',
		canActivate: [AuthGuard],
		loadComponent: () =>
			import('./pages/collection-point/collection-point-form/collection-point-form.component').then(m => m.CollectionPointFormComponent),
	},
	{
		path: 'collection-point/:id',
		canActivate: [AuthGuard],
		loadComponent: () =>
			import('./pages/collection-point/collection-point-detail/collection-point-detail.component').then(m => m.CollectionPointDetailComponent),
	},
	{
		path: 'collection-point/:id/edit',
		canActivate: [AuthGuard],
		loadComponent: () =>
			import('./pages/collection-point/collection-point-form/collection-point-form.component').then(m => m.CollectionPointFormComponent),
	},
	{
		path: 'daily-route',
		canActivate: [AuthGuard],
		loadComponent: () =>
			import('./pages/route/daily-route.page.component').then(m => m.DailyRoutePageComponent),
	}
];
