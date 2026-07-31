import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehouseService, Warehouse, WarehouseSummary } from '../../services/warehouse.service';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="warehouses">
      <h1>Warehouses</h1>
      <p class="subtitle">Naval base warehouse locations and inventory summaries</p>

      <div *ngIf="loading" class="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="warehouse-grid" *ngIf="!loading && !error">
        <div class="warehouse-card" *ngFor="let s of summaries">
          <div class="wh-header">
            <span class="wh-icon">&#127981;</span>
            <div>
              <h3>{{ s.warehouseName }}</h3>
              <span class="wh-state">{{ s.stateCode }}</span>
            </div>
          </div>
          <div class="wh-stats">
            <div class="wh-stat">
              <span class="wh-stat-label">Items</span>
              <span class="wh-stat-value">{{ s.totalItems }}</span>
            </div>
            <div class="wh-stat">
              <span class="wh-stat-label">Units</span>
              <span class="wh-stat-value">{{ s.totalUnits }}</span>
            </div>
            <div class="wh-stat">
              <span class="wh-stat-label">Value</span>
              <span class="wh-stat-value">{{ s.totalValue | currency:'USD' }}</span>
            </div>
          </div>
        </div>
      </div>

      <h2>All Warehouses</h2>
      <div class="table-container" *ngIf="!loading && !error">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Warehouse Name</th>
              <th>Location</th>
              <th>State</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let w of warehouses">
              <td>{{ w.warehouseId }}</td>
              <td>{{ w.warehouseName }}</td>
              <td>{{ w.location }}</td>
              <td>{{ w.stateCode }}</td>
              <td>
                <span *ngIf="w.isActive === 'Y'" class="status active">Active</span>
                <span *ngIf="w.isActive !== 'Y'" class="status inactive">Inactive</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .warehouses h1 { margin: 0 0 0.5rem 0; color: #1a1a2e; }
    .subtitle { color: #666; margin: 0 0 1.5rem 0; font-size: 0.9rem; }
    .loading { padding: 2rem; text-align: center; color: #666; }
    .error { padding: 1rem; background: #fee; border: 1px solid #c00; border-radius: 8px; color: #c00; }
    .warehouse-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .warehouse-card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .wh-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .wh-icon { font-size: 2.5rem; }
    .wh-header h3 { margin: 0; font-size: 1.1rem; color: #1a1a2e; }
    .wh-state { font-size: 0.8rem; color: #666; }
    .wh-stats { display: flex; justify-content: space-between; gap: 1rem; }
    .wh-stat { display: flex; flex-direction: column; }
    .wh-stat-label { font-size: 0.75rem; color: #999; }
    .wh-stat-value { font-size: 1.2rem; font-weight: 700; color: #1a1a2e; }
    h2 { color: #1a1a2e; margin: 2rem 0 1rem 0; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a1a2e; color: #fff; padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; }
    td { padding: 0.6rem 1rem; border-bottom: 1px solid #eee; font-size: 0.85rem; }
    tr:hover { background: #f8f9fa; }
    .status { font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; }
    .status.active { background: #e0f5e0; color: #060; }
    .status.inactive { background: #f0f0f0; color: #999; }
  `]
})
export class WarehousesComponent implements OnInit {
  loading = true;
  error: string | null = null;
  warehouses: Warehouse[] = [];
  summaries: WarehouseSummary[] = [];

  constructor(private warehouseService: WarehouseService) {}

  ngOnInit(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => { this.warehouses = data; },
      error: (err) => { this.error = 'Failed to load warehouses: ' + err.message; this.loading = false; }
    });
    this.warehouseService.getWarehouseSummary().subscribe({
      next: (data) => { this.summaries = data; this.loading = false; },
      error: (err) => { this.error = 'Failed to load summary: ' + err.message; this.loading = false; }
    });
  }
}