import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle, VehicleListResponse, VehicleResponse } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/vehicle';

  list(options: { search?: string; status?: string; fuel?: string; page?: number; limit?: number } = {}): Observable<VehicleListResponse> {
    let params = new HttpParams()
      .set('page', String(options.page ?? 1))
      .set('limit', String(options.limit ?? 10));

    if (options.search) params = params.set('search', options.search);
    if (options.status) params = params.set('status', options.status);
    if (options.fuel) params = params.set('fuel_category', options.fuel);

    return this.http.get<VehicleListResponse>(this.baseUrl, { params });
  }

  get(id: number): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Vehicle>): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Vehicle>): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}