import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryItem {
  itemId: number;
  sku: string;
  itemName: string;
  categoryName: string;
  warehouseName: string;
  stateCode: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
  totalValue: number;
  lastUpdated: string;
  lowStock: boolean;
}

export interface Warehouse {
  warehouseId: number;
  warehouseName: string;
  location: string;
  stateCode: string;
  isActive: string;
}

export interface WarehouseSummary {
  warehouseName: string;
  stateCode: string;
  totalItems: number;
  totalUnits: number;
  totalValue: number;
}

export interface StockMovement {
  movementId: number;
  itemId: number;
  sku: string;
  itemName: string;
  movementType: string;
  quantity: number;
  reference: string;
  movementDate: string;
  username: string;
  warehouseName: string;
}

export interface MovementRequest {
  itemId: number;
  warehouseId: number;
  movementType: string;
  quantity: number;
  reference: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  // WildFly backend URL — uses container name in Docker network
  private baseUrl = '/warehouse/rest/api';

  constructor(private http: HttpClient) {}

  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.baseUrl}/inventory`);
  }

  getLowStock(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.baseUrl}/inventory/low-stock`);
  }

  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.baseUrl}/warehouses`);
  }

  getWarehouseSummary(): Observable<WarehouseSummary[]> {
    return this.http.get<WarehouseSummary[]>(`${this.baseUrl}/warehouses/summary`);
  }

  getMovementHistory(itemId: number): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.baseUrl}/movements/${itemId}`);
  }

  addStockMovement(req: MovementRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/movements`, req);
  }

  health(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }
}