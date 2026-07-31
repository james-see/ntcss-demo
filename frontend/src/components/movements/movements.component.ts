import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehouseService, StockMovement, InventoryItem, Warehouse, MovementRequest } from '../../services/warehouse.service';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="movements">
      <h1>Stock Movements</h1>
      <p class="subtitle">Record and view stock movements (inbound / outbound / transfer)</p>

      <div class="form-container">
        <h2>Record New Movement</h2>
        <form (ngSubmit)="submitMovement()" #moveForm="ngForm">
          <div class="form-row">
            <div class="form-field">
              <label>Item</label>
              <select [(ngModel)]="newMovement.itemId" name="itemId" required>
                <option value="">Select item...</option>
                <option *ngFor="let i of inventory" [value]="i.itemId">{{ i.sku }} - {{ i.itemName }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>Warehouse</label>
              <select [(ngModel)]="newMovement.warehouseId" name="warehouseId" required>
                <option value="">Select warehouse...</option>
                <option *ngFor="let w of warehouses" [value]="w.warehouseId">{{ w.warehouseName }} ({{ w.stateCode }})</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Type</label>
              <select [(ngModel)]="newMovement.movementType" name="movementType" required>
                <option value="">Select...</option>
                <option value="I">Inbound</option>
                <option value="O">Outbound</option>
                <option value="T">Transfer</option>
              </select>
            </div>
            <div class="form-field">
              <label>Quantity</label>
              <input type="number" [(ngModel)]="newMovement.quantity" name="quantity" min="1" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Reference (PO/REQ number)</label>
              <input type="text" [(ngModel)]="newMovement.reference" name="reference" placeholder="PO-2026-XXX or REQ-2026-XXX" />
            </div>
            <div class="form-field">
              <label>Username</label>
              <input type="text" [(ngModel)]="newMovement.username" name="username" placeholder="Your username" required />
            </div>
          </div>
          <button type="submit" [disabled]="!moveForm.valid" class="btn-submit">Record Movement</button>
          <span *ngIf="submitMsg" class="submit-msg" [class.success]="submitSuccess" [class.error]="!submitSuccess">{{ submitMsg }}</span>
        </form>
      </div>

      <div class="history-section">
        <h2>Movement History</h2>
        <div class="filter-row">
          <select (change)="loadHistory($event)">
            <option value="">Select an item to view history...</option>
            <option *ngFor="let i of inventory" [value]="i.itemId">{{ i.sku }} - {{ i.itemName }}</option>
          </select>
        </div>

        <div *ngIf="historyLoading" class="loading">Loading history...</div>
        <div *ngIf="!historyLoading && movements.length === 0" class="empty">Select an item above to view its movement history.</div>

        <div class="table-container" *ngIf="!historyLoading && movements.length > 0">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Item</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Reference</th>
                <th>Warehouse</th>
                <th>Date</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of movements">
                <td>{{ m.movementId }}</td>
                <td class="sku">{{ m.sku }}</td>
                <td>{{ m.itemName }}</td>
                <td>
                  <span *ngIf="m.movementType === 'I'" class="type inbound">IN</span>
                  <span *ngIf="m.movementType === 'O'" class="type outbound">OUT</span>
                  <span *ngIf="m.movementType === 'T'" class="type transfer">TRFR</span>
                </td>
                <td>{{ m.quantity }}</td>
                <td>{{ m.reference || '-' }}</td>
                <td>{{ m.warehouseName }}</td>
                <td>{{ m.movementDate }}</td>
                <td>{{ m.username }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .movements h1 { margin: 0 0 0.5rem 0; color: #1a1a2e; }
    .subtitle { color: #666; margin: 0 0 1.5rem 0; font-size: 0.9rem; }
    .form-container { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 2rem; }
    .form-container h2 { margin: 0 0 1rem 0; color: #1a1a2e; font-size: 1.1rem; }
    .form-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .form-field { flex: 1; display: flex; flex-direction: column; }
    .form-field label { font-size: 0.8rem; color: #666; margin-bottom: 0.25rem; font-weight: 600; }
    .form-field input, .form-field select { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 8px; font-size: 0.9rem; }
    .btn-submit { background: #0f3460; color: #fff; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
    .btn-submit:disabled { background: #999; cursor: not-allowed; }
    .btn-submit:hover:not(:disabled) { background: #1a4a80; }
    .submit-msg { margin-left: 1rem; font-size: 0.85rem; }
    .submit-msg.success { color: #060; }
    .submit-msg.error { color: #c00; }
    .history-section h2 { color: #1a1a2e; margin: 0 0 1rem 0; }
    .filter-row { margin-bottom: 1rem; }
    .filter-row select { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 8px; min-width: 300px; }
    .loading { padding: 2rem; text-align: center; color: #666; }
    .empty { padding: 2rem; text-align: center; color: #999; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a1a2e; color: #fff; padding: 0.75rem 1rem; text-align: left; font-size: 0.8rem; }
    td { padding: 0.6rem 1rem; border-bottom: 1px solid #eee; font-size: 0.85rem; }
    tr:hover { background: #f8f9fa; }
    .sku { font-family: monospace; font-weight: 600; color: #0f3460; }
    .type { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
    .type.inbound { background: #e0f5e0; color: #060; }
    .type.outbound { background: #ffe0e0; color: #c00; }
    .type.transfer { background: #e0eaf6; color: #1a237e; }
  `]
})
export class MovementsComponent implements OnInit {
  inventory: InventoryItem[] = [];
  warehouses: Warehouse[] = [];
  movements: StockMovement[] = [];
  historyLoading = false;
  submitMsg: string | null = null;
  submitSuccess = false;

  newMovement: MovementRequest = {
    itemId: 0, warehouseId: 0, movementType: '', quantity: 0, reference: '', username: ''
  };

  constructor(private warehouseService: WarehouseService) {}

  ngOnInit(): void {
    this.warehouseService.getInventory().subscribe({
      next: (data) => { this.inventory = data; },
      error: () => {}
    });
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => { this.warehouses = data; },
      error: () => {}
    });
  }

  loadHistory(event: any): void {
    const itemId = Number(event.target.value);
    if (!itemId) { this.movements = []; return; }
    this.historyLoading = true;
    this.warehouseService.getMovementHistory(itemId).subscribe({
      next: (data) => { this.movements = data; this.historyLoading = false; },
      error: () => { this.historyLoading = false; }
    });
  }

  submitMovement(): void {
    this.warehouseService.addStockMovement(this.newMovement).subscribe({
      next: () => {
        this.submitMsg = 'Movement recorded successfully!';
        this.submitSuccess = true;
        this.newMovement = { itemId: 0, warehouseId: 0, movementType: '', quantity: 0, reference: '', username: '' };
        setTimeout(() => { this.submitMsg = null; }, 3000);
      },
      error: (err) => {
        this.submitMsg = 'Failed: ' + err.message;
        this.submitSuccess = false;
      }
    });
  }
}