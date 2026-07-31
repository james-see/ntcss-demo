# NTCSS Warehouse Inventory Demo — Architecture Briefing

## What This Is

A working prototype of a warehouse inventory management system built to demonstrate the modernization pattern for the Naval Tactical Command Support System (NTCSS). It shows how legacy NTCSS applications — currently running on outdated JBoss servers with old security and Sybase databases — can be modernized while preserving the existing data, stored procedures, and external system interfaces.

The demo runs entirely on a laptop using containers (Docker/OrbStack), simulating what a production deployment on Navy infrastructure (NTCSS, CANES, NMCI, ONE-Net) would look like.

---

## The Problem

NTCSS today runs on aging technology:

- **JBoss EAP 6 or older** — application servers that are no longer receiving security updates
- **Legacy security (PicketBox)** — the old authentication system that predates modern security standards
- **Sybase ASE** — a relational database that has been the backbone of NTCSS modules like R-Supply and NALCOMIS for decades
- **JVM-based applications** — Java applications built years ago that are difficult to maintain and deploy

The Navy needs to modernize this stack without losing the decades of business logic, stored procedures, and data schemas that already exist in Sybase. The SOW (Section 4.6) specifically calls for Sybase compatibility and preservation of all external system interfaces.

---

## What We Built

A warehouse inventory manager that tracks parts and supplies across four naval bases:

- **Norfolk Naval Base** (Virginia)
- **San Diego Naval Base** (California)
- **Pearl Harbor** (Hawaii)
- **Yokosuka Naval Base** (Japan)

The system manages 10 inventory items (circuit breakers, marine cable, bolts, tools, safety gear, etc.) across these four locations, with features for tracking stock levels, recording movements (inbound/outbound/transfer), flagging low-stock items, and producing warehouse-level summaries.

---

## The Technology Stack (In Plain English)

### Frontend: Angular 17

The user interface — what a person sees in their web browser. Angular is Google's framework for building web applications. Version 17 is the current modern release with "standalone components," meaning each page (dashboard, inventory list, stock movement form) is self-contained and doesn't depend on a complex setup to work.

The frontend talks to the backend over REST (a standard way for web applications to exchange data). It includes an authentication interceptor that automatically attaches the user's credentials to every API call so the backend knows who's asking.

**Why Angular?** It's widely used in Department of Defense and federal systems, has long-term support guarantees, and pairs well with Java backends. The standalone component architecture keeps the code simple and maintainable.

### Backend: WildFly 25 (JBoss EAP 8.1 Pattern)

The application server — where the business logic lives. WildFly is the open-source version of JBoss. Red Hat takes WildFly, tests it extensively, adds long-term support, and sells it as JBoss EAP (Enterprise Application Platform).

**Think of it like this:** WildFly is to JBoss EAP what Fedora is to Red Hat Enterprise Linux. Same code, same features — but EAP has the certification, support contract, and stability guarantees that government customers require.

We used WildFly 25 for this demo because it's free and has the exact same capabilities as JBoss EAP 8.1. The code we wrote would deploy on JBoss EAP with zero changes — the APIs, configuration files, and security setup are identical.

The backend exposes a REST API with these endpoints:

| What It Does | Who Can Access It |
|---|---|
| Health check | Anyone (no login needed) |
| View all inventory | All logged-in users |
| View low-stock alerts | Admin and operators |
| View warehouses and summaries | All logged-in users |
| View stock movement history | All logged-in users |
| Record new stock movement | Admin and operators only |

### Security: Elytron

Elytron is WildFly's modern security system — the replacement for the legacy PicketBox that NTCSS currently uses. It handles three jobs:

**1. Authentication (Who are you?)**
When someone sends a request to the API, Elytron checks their username and password. In our demo, we have three users:
- **admin** — full access (view, add movements, everything)
- **operator** — can view and record stock movements
- **viewer** — read-only access

Credentials are checked against a properties file on the server. In a production NTCSS deployment, this could be wired to Active Directory, CAC/PIV cards, or any other identity provider — Elytron supports all of these.

**2. Authorization (What can you do?)**
Every API endpoint has role rules attached. Elytron enforces these on every single request. If a viewer tries to record a stock movement, Elytron blocks it — they get a 403 Forbidden response. The application code doesn't need to check permissions itself; Elytron handles it at the server level.

**3. Encryption (How do we talk securely?)**
Elytron manages TLS/SSL certificates and encryption. Our demo runs over HTTP (no encryption) for simplicity, but Elytron has the infrastructure ready for HTTPS. In production, this is where CAC-enabled mutual TLS would be configured.

**Why Elytron matters for NTCSS:** The legacy PicketBox security is deprecated and doesn't support modern authentication standards (OAuth, OIDC, SAML, client certificates). Elytron is modular — you can swap authentication methods without rewriting the application. This is critical for NTCSS modernization because different deployment environments (shore-based vs. afloat) may use different identity systems.

### Database: Sybase-Compatible Schema on PostgreSQL

The database — where all the inventory data lives. NTCSS has used Sybase ASE (Adaptive Server Enterprise) for decades. Our demo includes two database schemas:

1. **init.sql** — a true Sybase ASE schema with stored procedures (sp_get_all_inventory, sp_add_movement, etc.), designed to run on actual Sybase
2. **init-postgres.sql** — the same schema adapted for PostgreSQL, which we use in the demo

**Why not just run Sybase?** The Sybase ASE Docker image only runs on x86 processors (Intel/AMD). Modern Mac laptops use Apple Silicon (ARM), which can't run the Sybase binary — it crashes under emulation. PostgreSQL runs natively everywhere and is Sybase-compatible in syntax (both use T-SQL-style conventions). The table names, column names, stored procedure names, and data model are identical between the two schemas.

**For production:** Swapping back to real Sybase is a configuration change — install the Sybase JDBC driver (jconn4.jar) as a WildFly module, change the connection URL from `jdbc:postgresql://...` to `jdbc:sybase:Tds://...`, and point it at the real Sybase server. The Java application code doesn't change at all. We've included the full Sybase schema and the Sybase JDBC driver installation steps in the repo for exactly this purpose.

The database includes:
- **5 tables** for inventory data (categories, warehouses, items, stock levels, movement audit trail)
- **2 tables** for security (users and roles — Elytron can authenticate against the database itself)
- **5 stored procedures/functions** that mirror existing NTCSS Sybase procedures
- **3 views** for common queries (all inventory, low stock, warehouse summaries)
- **Seed data** — 10 items, 4 warehouses, 40 stock records, 7 sample movements

### Container Orchestration: Docker Compose / OrbStack

Everything runs in containers — isolated, self-contained packages that include the application and all its dependencies. Docker Compose defines how the three containers (database, application server, web frontend) connect to each other.

OrbStack is a lightweight container runtime for macOS that replaces Docker Desktop. It's faster and uses less memory while being fully Docker-compatible.

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                 User's Web Browser                     │
│                                                        │
│              Angular 17 Frontend                       │
│         (Dashboard, Inventory, Movements)              │
│                                                        │
│              Port 4200 (nginx)                         │
└──────────────────┬───────────────────────────────────┘
                   │  REST API calls (Basic Auth)
                   │
┌──────────────────▼───────────────────────────────────┐
│           WildFly 25 Application Server                │
│           (JBoss EAP 8.1 equivalent)                   │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   JAX-RS     │  │   Elytron    │  │  JDBC      │ │
│  │   REST API   │  │   Security   │  │  DataPool  │ │
│  │              │  │              │  │            │ │
│  │  /rest/api/  │  │  BASIC auth  │  │  5-20 conn │ │
│  │  inventory   │  │  3 roles:    │  │  pool      │ │
│  │  movements   │  │  admin       │  │            │ │
│  │  warehouses  │  │  operator    │  │            │ │
│  │              │  │  viewer      │  │            │ │
│  └──────────────┘  └──────────────┘  └─────┬──────┘ │
│     Port 8080        Port 9990             │        │
└────────────────────────────────────────────┼────────┘
                                             │  JDBC
                                             │
┌────────────────────────────────────────────▼────────┐
│            Database (Sybase ASE pattern)               │
│            PostgreSQL 16 in this demo                  │
│                                                        │
│  Tables: categories, warehouses, inventory_items,      │
│          inventory_stock, stock_movements,             │
│          users, user_roles                             │
│                                                        │
│  Procedures: sp_get_all_inventory, sp_get_low_stock,   │
│              sp_get_warehouse_summary, sp_add_movement,│
│              sp_get_movement_history                   │
│                                                        │
│  Port 5000 (maps to Postgres 5432)                    │
└────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Why WildFly instead of actual JBoss EAP?

JBoss EAP requires a Red Hat subscription. WildFly 25 has the identical feature set (Elytron, JAX-RS, JDBC, Jakarta EE 8) and is free. The code, configuration, and deployment artifacts are interchangeable. For a demonstration, WildFly is the right choice. For production, JBoss EAP 8.1 provides the support contract and certification that Navy accreditation processes require.

### 2. Why PostgreSQL instead of actual Sybase?

The Sybase ASE Docker image only runs on x86 (Intel/AMD) hardware. Our development machine is Apple Silicon (ARM). PostgreSQL was chosen because:
- It runs natively on all platforms
- Its SQL syntax is close to Sybase's T-SQL
- The schema, table names, column names, and stored procedure names are identical
- Swapping to real Sybase in production is a driver + connection string change only — no application code changes

The repository includes the full Sybase schema (init.sql) ready for deployment on x86 infrastructure.

### 3. Why Elytron instead of the legacy security?

The legacy PicketBox security is deprecated in JBoss EAP 8.x and will be removed in future versions. Elytron is the supported replacement. More importantly:
- Elytron supports modern auth standards (OAuth 2.0, OpenID Connect, SAML, mutual TLS/CAC)
- It's modular — you can change authentication methods without rewriting applications
- It provides a unified security model across HTTP, EJB, and other subsystems
- It's required for JBoss EAP 8.1 certification compliance

### 4. Why Angular 17 with standalone components?

Angular is already used in federal systems and has long-term support. Version 17's standalone component architecture eliminates the need for NgModules (a source of complexity in older Angular apps), making the code simpler to maintain and easier to review for accreditation.

### 5. Why Docker Compose instead of Kubernetes?

For a demonstration, Docker Compose is simpler to run and understand than a full Kubernetes cluster. The containerized architecture is Kubernetes-ready — each service (database, app server, frontend) is a separate container that can be deployed as pods in a K8s cluster. The NTCSS production deployment would target Kubernetes (CANES or cloud-native environments).

---

## How to Run It

```bash
# From the project directory:
docker compose up --build

# Wait ~60 seconds for everything to start

# Open the web app:
# http://localhost:4200

# Test the API:
curl http://localhost:8080/warehouse/rest/api/health
curl -u admin:admin123! http://localhost:8080/warehouse/rest/api/inventory
```

**Login credentials:**
- admin / admin123! (full access)
- operator / operator123! (view + record movements)
- viewer / viewer123! (view only)

---

## How This Maps to NTCSS Modernization

| Demo Component | NTCSS Production Equivalent |
|---|---|
| WildFly 25 | JBoss EAP 8.1 (Red Hat subscription) |
| PostgreSQL (Sybase-compatible) | Sybase ASE 16.0 (existing NTCSS database) |
| Elytron BASIC auth | Elytron with CAC/PIV or Active Directory |
| Docker Compose | Kubernetes on CANES or cloud (Gov Cloud IL5) |
| Angular 17 frontend | Angular 17+ (same — meets accessibility standards) |
| Warehouse inventory schema | R-Supply, NALCOMIS OMA/OOMA schemas |
| REST API endpoints | NTCSS module APIs (supply, maintenance, reporting) |

The modernization approach preserves what works (the Sybase data model, stored procedures, business logic) while replacing the infrastructure around it (application server, security system, frontend technology). This is the lowest-risk path — the data doesn't move, the procedures don't change, and the business logic stays in place. Only the delivery mechanism modernizes.

---

## Repository

**GitHub:** https://github.com/james-see/ntcss-demo

**Local path:** ~/p/ntcss-demo

**Stack versions:**
- WildFly 25.0.0.Final (WildFly Core 17.0.1.Final)
- Angular 17 (standalone components)
- PostgreSQL 16 Alpine
- Java 11 (Jakarta EE 8 / javax.* namespace)
- Maven 3.9 (build tool)
- nginx Alpine (frontend serving + reverse proxy)
- Docker Compose / OrbStack