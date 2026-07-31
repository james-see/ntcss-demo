import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <span class="nav-icon">&#128230;</span>
        Warehouse Inventory Manager
        <span class="nav-badge">NTCSS Pattern</span>
      </div>
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
        <a routerLink="/inventory" routerLinkActive="active">Inventory</a>
        <a routerLink="/low-stock" routerLinkActive="active">Low Stock</a>
        <a routerLink="/warehouses" routerLinkActive="active">Warehouses</a>
        <a routerLink="/movements" routerLinkActive="active">Movements</a>
      </div>
    </nav>
    <main class="main-content">
      <router-outlet />
    </main>
    <footer class="footer">
      <span>WildFly 25 + Elytron Security + Sybase ASE | J2EE / JBoss EAP 8.1 Pattern | OrbStack</span>
    </footer>
  `,
  styles: [`
    .navbar { display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; background: #1a1a2e; color: #fff; height: 64px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .nav-brand { font-size: 1.2rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
    .nav-icon { font-size: 1.5rem; }
    .nav-badge { font-size: 0.7rem; background: #0f3460; padding: 2px 8px; border-radius: 4px; color: #e0e0e0; font-weight: 400; }
    .nav-links { display: flex; gap: 1.5rem; }
    .nav-links a { color: #b0b0b0; text-decoration: none; font-size: 0.95rem; transition: color 0.2s; }
    .nav-links a:hover { color: #fff; }
    .nav-links a.active { color: #00d4ff; border-bottom: 2px solid #00d4ff; padding-bottom: 4px; }
    .main-content { padding: 2rem; min-height: calc(100vh - 128px); background: #f0f2f5; }
    .footer { background: #1a1a2e; color: #666; text-align: center; padding: 1rem; font-size: 0.8rem; }
  `]
})
export class AppComponent {}