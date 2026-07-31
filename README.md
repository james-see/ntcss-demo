# Warehouse Inventory Manager - NTCSS Modernization Pattern

J2EE + Angular 17 + WildFly (JBoss EAP 8.1 pattern) + Elytron Security + Sybase ASE

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Angular 17 Frontend                    │
│              (Standalone components, REST)                │
│                   Port 4200 (nginx)                       │
└──────────────────┬──────────────────────────────────────┘
                   │ REST / HTTP (Basic Auth)
┌──────────────────▼──────────────────────────────────────┐
│              WildFly 25 (JBoss EAP 8.1 pattern)            │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  JAX-RS     │  │  Elytron     │  │  J2EE        │  │
│  │  REST API   │  │  Security    │  │  DataSources │  │
│  │  /rest/api  │  │  BASIC Auth  │  │  JDBC Pool   │  │
│  │             │  │  Roles:      │  │              │  │
│  │             │  │  admin       │  │              │  │
│  │             │  │  operator    │  │              │  │
│  │             │  │  viewer      │  │              │  │
│  └─────────────┘  └──────────────┘  └──────┬───────┘  │
│     Port 8080        Port 9990            │          │
└──────────────────────────────────────────┼──────────┘
                                           │ JDBC
                                           │ jdbc:sybase:Tds:...
┌──────────────────────────────────────────▼──────────┐
│                Sybase ASE 16.0                         │
│                                                         │
│  Tables: categories, warehouses, inventory_items,       │
│         inventory_stock, stock_movements                 │
│                                                         │
│  Stored Procedures: sp_get_all_inventory,                │
│    sp_get_low_stock, sp_get_warehouse_summary,          │
│    sp_add_movement, sp_get_movement_history              │
│                                                         │
│  Port 5000                                             │
└─────────────────────────────────────────────────────────┘
```

## Stack

- **Frontend**: Angular 17 (standalone components), nginx reverse proxy
- **Backend**: J2EE / Jakarta EE on WildFly 25 (JBoss EAP 8.1 pattern)
- **Security**: Elytron (WildFly security subsystem) with BASIC auth, role-based access
- **Database**: Sybase ASE 16.0 via Docker (datagrip/sybase image)
- **JDBC**: Sybase jConnect (jconn4) as WildFly module
- **Container**: OrbStack / Docker Compose

## Quick Start

```bash
cd ~/Downloads/warehouse-inventory
docker compose up --build
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:8080/warehouse/rest/api/health
- WildFly Console: http://localhost:9990

## Elytron Security

The WildFly configuration uses Elytron with:
- `ApplicationDomain` security domain
- `ApplicationRealm` properties-based realm
- BASIC authentication mechanism
- Role-based access control (admin, operator, viewer)
- HTTP and SASL authentication factories

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /rest/api/health | None | Health check |
| GET | /rest/api/inventory | viewer+ | All inventory items |
| GET | /rest/api/inventory/low-stock | operator+ | Low stock items |
| GET | /rest/api/warehouses | viewer+ | All warehouses |
| GET | /rest/api/warehouses/summary | viewer+ | Warehouse summary |
| GET | /rest/api/movements/{itemId} | viewer+ | Movement history |
| POST | /rest/api/movements | operator+ | Record new movement |

## Database Schema

- **categories**: Item categories (Electronics, Hardware, Tools, etc.)
- **warehouses**: Naval base locations (Norfolk, San Diego, Pearl Harbor, Yokosuka)
- **inventory_items**: SKU master with price and reorder levels
- **inventory_stock**: Stock quantities per item per warehouse
- **stock_movements**: Audit trail of all stock changes

## NTCSS Context

This mirrors the architecture from the NTCSS (Naval Tactical Command Support System)
modernization pattern: J2EE on JBoss EAP with Elytron, Sybase ASE backend, Angular
frontend, and external system interfaces preserved (R-Supply, NALCOMIS, etc.).