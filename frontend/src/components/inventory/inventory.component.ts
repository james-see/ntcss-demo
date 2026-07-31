import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehouseService, InventoryItem } from '../../services/warehouse.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inventory">
      <h1>Inventory</h1>
      <p class="subtitle">All inventory items across all warehouses</p>

      <div class="filters">
        <input type="text" placeholder="Search by SKU or name..." (input)="filter($event)" />
        <select (change)="filterWarehouse($event)">
          <option value="">All Warehouses</option>
          <option *ngFor="let w of warehouses" value="{{w}}">{{w}}</option>
        </select>
      </div>

      <div *ngIf="loading" class="loading">Loading inventory...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="table-container" *ngIf="!loading && !error">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Warehouse</th>
              <th>State</th>
              <th>Qty</th>
              <th>Reorder Lvl</th>
              <th>Unit Price</th>
              <th>Total Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredItems">
              <td class="sku">{{ item.sku }}</td>
              <td>{{ item.itemName }}</td>
              <td><span class="badge">{{ item.categoryName }}</span></td>
              <td>{{ item.warehouseName || '-' }}</td>
              <td>{{ item.stateCode || '-' }}</td>
              <td class="qty" [class.low]="item.lowStock">{{ item.quantity }}</td>
              <td>{{ item.reorderLevel }}</td>
              <td>{{ item.unitPrice | currency:'USD' }}</td>
              <td>{{ item.totalValue | currency:'USD' }}</td>
              <td>
                <span *ngIf="item.lowStock" class="status low">LOW STOCK</span>
                <span *ngIf="!item.lowStock && item.quantity === 0" class="status out">OUT</span>
                <span *ngIf="!item.lowStock && item.quantity > 0" class="status ok">OK</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div *ngIf="!loading && !error && filteredItems.length === 0" class="empty">No inventory items found.</div>
    </div>
  `,
  styles: [`
    .inventory h1 { margin: 0 0 0.5rem 0; color: #1a1a2e; }
    .subtitle { color: #666; margin: 0 0 1.5rem 0; font-size: 0.9rem; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .filters input, .filters select { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 8px; font-size: 0.9rem; }
    .filters input { flex: 1; max-width: 300px; }
    .loading { padding: 2rem; text-align: center; color: #666; }
    .error { padding: 1rem; background: #fee; border: 1px solid #c00; border-radius: 8px; color: #c00; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a1a2e; color: #fff; padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; white-space: nowrap; }
    td { padding: 0.6rem 1rem; border-bottom: 1px solid #eee; font-size: 0.85rem; }
    tr:hover { background: #f8f9fa; }
    .sku { font-family: monospace; font-weight: 600; color: #0f3460; }
    .qty.low { color: #ff6b6b; font-weight: 700; }
    .badge { background: #e8eaf6; color: #1a237e; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; }
    .status { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
    .status.low { background: #ffe0e0; color: #c00; }
    .status.out { background: #ffd6d6; color: #900; }
    .status.ok { background: #e0f5e0; color: #060; }
    .empty { text-align: center; padding: 3rem; color: #999; }
  `]
})
export class InventoryComponent implements OnInit {
  loading = true;
  error: string | null = null;
  allItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  warehouses: string[] = [];
  searchText = '';
  selectedWarehouse = '';

  constructor(private warehouseService: WarehouseService) {}

  ngOnInit(): void {
    this.warehouseService.getInventory().subscribe({
      next: (data) => {
        this.allItems = data;
        this.filteredItems = data;
        this.warehouses = [...new Set(data.map(i => i.warehouseName).filter(Boolean))];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load inventory: ' + err.message;
        this.loading = false;
      }
    });
  }

  filter(event: any): void {
    this.searchText = event.target.value.toLowerCase();
    this.applyFilters();
  }

  filterWarehouse(event: any): void {
    this.selectedWarehouse = event.target.value;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredItems = this.allItems.filter(item => {
      const matchSearch = !this.searchText ||
        item.sku?.toLowerCase().includes(this.searchText) ||
        item.itemName?.toLowerCase().includes(this.searchText);
      const matchWarehouse = !this.selectedWarehouse || item.warehouseName === this.selectedWarehouse;
      return matchSearch && matchWarehouse;
    });
  }
}