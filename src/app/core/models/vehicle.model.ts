export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
export type FuelCategory = 'GASOLINE' | 'DIESEL';

export interface Vehicle {
  id: number;
  vehicle_reg_num: string;
  status: VehicleStatus;
  regular_capacity: number;
  recycle_capacity: number;
  current_driver_id?: number | null;
  problem_reported?: string | null;
  fuel_category: FuelCategory;
  depreciation_thb: number;
  vehicle_type?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface VehicleListResponse {
  success: boolean;
  data: Vehicle[];
  total?: number;
}

export interface VehicleResponse {
  success: boolean;
  data: Vehicle;
}