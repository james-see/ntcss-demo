import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehouseService, InventoryItem } from '../../services/warehouse.service';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="low-stock">
      <h1>Low Stock Alerts</h1>
      <p class="subtitle">Items below reorder level - action required</p>

      <div *ngIf="loading" class="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <div *ngIf="!loading && !error && items.length === 0" class="all-clear">
        All items are above reorder level.
      </div>

      <div class="table-container" *ngIf="!loading && !error && items.length > 0">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item Name</th>
              <th>Warehouse</th>
              <th>State</th>
              <th>Current Qty</th>
              <th>Reorder Level</th>
              <th>Deficit</th>
              <th>Unit Price</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td class="sku">{{ item.sku }}</td>
              <td>{{ item.itemName }}</td>
              <td>{{ item.warehouseName }}</td>
              <td>{{ item.stateCode }}</td>
              <td class="qty-low">{{ item.quantity }}</td>
              <td>{{ item.reorderLevel }}</td>
              <td class="deficit">{{ item.reorderLevel - item.quantity }}</td>
              <td>{{ item.unitPrice | currency:'USD' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .low-stock h1 { margin: 0 0 0.5rem 0; color: #1a1a2e; }
    .subtitle { color: #666; margin: 0 0 1.5rem 0; font-size: 0.9rem; }
    .loading { padding: 2rem; text-align: center; color: #666; }
    .error { padding: 1rem; background: #fee; border: 1px solid #c00; border-radius: 8px; color: #c00; }
    .all-clear { padding: 2rem; text-align: center; background: #e0f5e0; border-radius: 12px; color: #060; font-size: 1.1rem; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #c0392b; color: #fff; padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; }
    td { padding: 0.6rem 1rem; border-bottom: 1px solid #eee; font-size: 0.85rem; }
    tr:hover { background: #fff5f5; }
    .sku { font-family: monospace; font-weight: 600; color: #0f3460; }
    .qty-low { color: #c0392b; font-weight: 700; }
    .deficit { color: #c0392b; font-weight: 700; }
  `]
})
export class LowStockComponent implements OnInit {
  loading = true;
  error: string | null = null;
  items: InventoryItem[] = [];

  constructor(private warehouseService: WarehouseService) {}

  ngOnInit(): void {
    this.warehouseService.getLowStock().subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: (err) => { this.error = 'Failed to load low stock: ' + err.message; this.loading = false; }
    });
  }
}