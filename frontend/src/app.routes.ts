import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { LowStockComponent } from './components/low-stock/low-stock.component';
import { WarehousesComponent } from './components/warehouses/warehouses.component';
import { MovementsComponent } from './components/movements/movements.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'low-stock', component: LowStockComponent },
  { path: 'warehouses', component: WarehousesComponent },
  { path: 'movements', component: MovementsComponent },
  { path: '**', redirectTo: '' }
];