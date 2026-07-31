import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehouseService, WarehouseSummary, InventoryItem } from '../../services/warehouse.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <p class="subtitle">Warehouse Inventory Overview - J2EE / WildFly / Elytron / Sybase ASE</p>

      <div *ngIf="loading" class="loading">Loading data from WildFly backend...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="stats-grid" *ngIf="!loading && !error">
        <div class="stat-card">
          <div class="stat-icon">&#128230;</div>
          <div class="stat-value">{{ totalItems }}</div>
          <div class="stat-label">Total SKUs</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">&#128722;</div>
          <div class="stat-value">{{ totalUnits }}</div>
          <div class="stat-label">Total Units</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">&#128176;</div>
          <div class="stat-value">{{ totalValue | currency:'USD' }}</div>
          <div class="stat-label">Total Value</div>
        </div>
        <div class="stat-card alert" *ngIf="lowStockCount > 0">
          <div class="stat-icon">&#9888;</div>
          <div class="stat-value">{{ lowStockCount }}</div>
          <div class="stat-label">Low Stock Items</div>
        </div>
      </div>

      <h2 *ngIf="!loading && !error">Warehouse Summary</h2>
      <div class="table-container" *ngIf="!loading && !error && summaries.length > 0">
        <table>
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>State</th>
              <th>Total Items</th>
              <th>Total Units</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of summaries">
              <td>{{ s.warehouseName }}</td>
              <td>{{ s.stateCode }}</td>
              <td>{{ s.totalItems }}</td>
              <td>{{ s.totalUnits }}</td>
              <td>{{ s.totalValue | currency:'USD' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .dashboard h1 { margin: 0 0 0.5rem 0; color: #1a1a2e; }
    .subtitle { color: #666; margin: 0 0 2rem 0; font-size: 0.9rem; }
    .loading { padding: 2rem; text-align: center; color: #666; font-size: 1.1rem; }
    .error { padding: 1rem; background: #fee; border: 1px solid #c00; border-radius: 8px; color: #c00; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-card.alert { border-left: 4px solid #ff6b6b; }
    .stat-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .stat-value { font-size: 2rem; font-weight: 700; color: #1a1a2e; }
    .stat-label { color: #666; font-size: 0.85rem; margin-top: 0.25rem; }
    h2 { color: #1a1a2e; margin: 2rem 0 1rem 0; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a1a2e; color: #fff; padding: 1rem; text-align: left; font-size: 0.85rem; }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid #eee; }
    tr:hover { background: #f8f9fa; }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;
  summaries: WarehouseSummary[] = [];
  inventory: InventoryItem[] = [];
  totalItems = 0;
  totalUnits = 0;
  totalValue = 0;
  lowStockCount = 0;

  constructor(private warehouseService: WarehouseService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.warehouseService.getWarehouseSummary().subscribe({
      next: (data) => {
        this.summaries = data;
        this.totalUnits = data.reduce((sum, w) => sum + w.totalUnits, 0);
        this.totalValue = data.reduce((sum, w) => sum + (w.totalValue || 0), 0);
        this.totalItems = data.length > 0 ? data[0].totalItems : 0;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard: ' + err.message;
        this.loading = false;
      }
    });

    this.warehouseService.getLowStock().subscribe({
      next: (items) => { this.lowStockCount = items.length; },
      error: () => { this.lowStockCount = 0; }
    });

    this.warehouseService.getInventory().subscribe({
      next: (items) => { this.totalItems = items.length; },
      error: () => {}
    });
  }
}