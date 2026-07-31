-- Warehouse inventory schema (Postgres with Sybase-compatible naming)
-- This mirrors the Sybase ASE schema but runs on Postgres

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description   VARCHAR(255)
);

-- Warehouses table (physical locations - naval bases)
CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id   SERIAL PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    location       VARCHAR(255) NOT NULL,
    state_code     VARCHAR(2)   NOT NULL,
    is_active      CHAR(1)      DEFAULT 'Y'
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    item_id       SERIAL PRIMARY KEY,
    sku           VARCHAR(50)  UNIQUE NOT NULL,
    item_name     VARCHAR(200) NOT NULL,
    category_id   INTEGER REFERENCES categories(category_id),
    description   VARCHAR(500),
    unit_price    NUMERIC(12,2) DEFAULT 0,
    reorder_level INTEGER DEFAULT 0
);

-- Inventory stock table (tracks stock per warehouse)
CREATE TABLE IF NOT EXISTS inventory_stock (
    stock_id      SERIAL PRIMARY KEY,
    item_id       INTEGER NOT NULL REFERENCES inventory_items(item_id),
    warehouse_id  INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    quantity      INTEGER NOT NULL DEFAULT 0,
    last_updated  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(item_id, warehouse_id)
);

-- Stock movements (audit trail)
CREATE TABLE IF NOT EXISTS stock_movements (
    movement_id   SERIAL PRIMARY KEY,
    item_id       INTEGER NOT NULL REFERENCES inventory_items(item_id),
    warehouse_id  INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    movement_type CHAR(1)  NOT NULL,  -- 'I' = inbound, 'O' = outbound, 'T' = transfer
    quantity      INTEGER  NOT NULL,
    reference     VARCHAR(100),
    movement_date TIMESTAMP NOT NULL DEFAULT NOW(),
    username      VARCHAR(50)
);

-- Security tables (for Elytron DatabaseServerLoginModule)
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    username VARCHAR(50) NOT NULL,
    role     VARCHAR(50) NOT NULL,
    PRIMARY KEY (username, role)
);

-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO categories (category_name, description) VALUES
    ('Electronics', 'Electronic components and devices'),
    ('Hardware', 'Screws, bolts, nuts, brackets'),
    ('Tools', 'Power tools and hand tools'),
    ('Office Supplies', 'Stationery and office consumables'),
    ('Safety Equipment', 'PPE and safety gear')
ON CONFLICT DO NOTHING;

INSERT INTO warehouses (warehouse_name, location, state_code, is_active) VALUES
    ('Norfolk Naval Base', 'Norfolk, VA', 'VA', 'Y'),
    ('San Diego Naval Base', 'San Diego, CA', 'CA', 'Y'),
    ('Pearl Harbor', 'Honolulu, HI', 'HI', 'Y'),
    ('Yokosuka Naval Base', 'Yokosuka, JP', 'JP', 'Y')
ON CONFLICT DO NOTHING;

INSERT INTO inventory_items (sku, item_name, category_id, description, unit_price, reorder_level) VALUES
    ('ELEC-001', 'Circuit Breaker 20A', 1, '20 amp circuit breaker for shipboard panels', 45.50, 50),
    ('ELEC-002', 'Marine Grade Cable 12AWG', 1, '12 AWG tinned copper marine cable, 100ft spool', 120.00, 20),
    ('HW-001', 'M6 Bolt Stainless 50mm', 2, 'M6 x 50mm 316 stainless steel bolt', 1.25, 500),
    ('HW-002', 'M8 Nut Stainless', 2, 'M8 316 stainless steel hex nut', 0.45, 1000),
    ('TOOL-001', 'Torque Wrench 1/2"', 3, 'Calibrated torque wrench 20-150 ft-lbs', 185.00, 5),
    ('TOOL-002', 'Digital Multimeter', 3, 'Fluke 87V industrial true RMS multimeter', 420.00, 10),
    ('OFF-001', 'Thermal Paper Rolls', 4, '3-1/8" x 230 thermal receipt paper, 50/case', 35.00, 30),
    ('SAFE-001', 'Safety Goggles Clear', 5, 'ANSI Z87.1 approved safety goggles', 8.50, 100),
    ('SAFE-002', 'Cut Resistant Gloves L', 5, 'Level 5 cut resistant gloves, size large', 22.00, 50),
    ('ELEC-003', 'LED Navigation Light', 1, 'Red LED navigation light, 12VDC, IP67', 78.00, 25)
ON CONFLICT DO NOTHING;

-- Stock for each item across warehouses
INSERT INTO inventory_stock (item_id, warehouse_id, quantity) VALUES
    (1, 1, 125), (1, 2, 80), (1, 3, 40), (1, 4, 15),
    (2, 1, 35),  (2, 2, 60), (2, 3, 22), (2, 4, 8),
    (3, 1, 750), (3, 2, 500), (3, 3, 300), (3, 4, 120),
    (4, 1, 1200), (4, 2, 800), (4, 3, 400), (4, 4, 200),
    (5, 1, 8),   (5, 2, 3),  (5, 3, 2),  (5, 4, 0),
    (6, 1, 15),  (6, 2, 12), (6, 3, 6),  (6, 4, 4),
    (7, 1, 40),  (7, 2, 25), (7, 3, 35), (7, 4, 10),
    (8, 1, 150), (8, 2, 200), (8, 3, 80), (8, 4, 45),
    (9, 1, 60),  (9, 2, 35), (9, 3, 25), (9, 4, 20),
    (10, 1, 30), (10, 2, 18), (10, 3, 12), (10, 4, 8)
ON CONFLICT DO NOTHING;

-- Sample stock movements
INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, reference, username) VALUES
    (1, 1, 'I', 125, 'PO-2026-001', 'admin'),
    (1, 2, 'I', 100, 'PO-2026-002', 'admin'),
    (1, 2, 'O', 20, 'REQ-2026-045', 'operator'),
    (3, 1, 'I', 1000, 'PO-2026-003', 'admin'),
    (3, 1, 'O', 250, 'REQ-2026-046', 'operator'),
    (5, 1, 'I', 10, 'PO-2026-004', 'admin'),
    (5, 1, 'O', 2, 'REQ-2026-047', 'operator')
ON CONFLICT DO NOTHING;

-- Security users
INSERT INTO users (username, password) VALUES
    ('admin', 'admin123!'),
    ('operator', 'operator123!'),
    ('viewer', 'viewer123!')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (username, role) VALUES
    ('admin', 'admin'),
    ('operator', 'operator'),
    ('viewer', 'viewer')
ON CONFLICT DO NOTHING;

-- =============================================
-- VIEWS (Sybase stored procedure equivalents as views/functions)
-- =============================================

CREATE OR REPLACE VIEW v_all_inventory AS
SELECT
    i.item_id, i.sku, i.item_name, c.category_name,
    i.unit_price, i.reorder_level,
    w.warehouse_name, w.state_code,
    s.quantity, s.last_updated::TEXT as last_updated,
    CASE WHEN s.quantity < i.reorder_level THEN true ELSE false END as low_stock
FROM inventory_items i
LEFT JOIN categories c ON i.category_id = c.category_id
LEFT JOIN inventory_stock s ON i.item_id = s.item_id
LEFT JOIN warehouses w ON s.warehouse_id = w.warehouse_id
ORDER BY i.sku, w.warehouse_name;

CREATE OR REPLACE VIEW v_low_stock AS
SELECT
    i.sku, i.item_name, i.reorder_level, s.quantity,
    w.warehouse_name, w.state_code,
    i.item_id, i.unit_price
FROM inventory_items i
JOIN inventory_stock s ON i.item_id = s.item_id
JOIN warehouses w ON s.warehouse_id = w.warehouse_id
WHERE s.quantity < i.reorder_level
ORDER BY i.sku;

CREATE OR REPLACE VIEW v_warehouse_summary AS
SELECT
    w.warehouse_name, w.state_code,
    COUNT(DISTINCT i.item_id) AS total_items,
    COALESCE(SUM(s.quantity), 0) AS total_units,
    COALESCE(SUM(s.quantity * i.unit_price), 0) AS total_value
FROM warehouses w
LEFT JOIN inventory_stock s ON w.warehouse_id = s.warehouse_id
LEFT JOIN inventory_items i ON s.item_id = i.item_id
GROUP BY w.warehouse_name, w.state_code
ORDER BY w.warehouse_name;

-- Function to add stock movement (replaces sp_add_movement)
CREATE OR REPLACE FUNCTION sp_add_movement(
    p_item_id INTEGER,
    p_warehouse_id INTEGER,
    p_movement_type CHAR(1),
    p_quantity INTEGER,
    p_reference VARCHAR(100),
    p_username VARCHAR(50)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, reference, username)
    VALUES (p_item_id, p_warehouse_id, p_movement_type, p_quantity, p_reference, p_username);

    IF p_movement_type = 'I' THEN
        UPDATE inventory_stock
        SET quantity = quantity + p_quantity, last_updated = NOW()
        WHERE item_id = p_item_id AND warehouse_id = p_warehouse_id;
    ELSIF p_movement_type = 'O' THEN
        UPDATE inventory_stock
        SET quantity = quantity - p_quantity, last_updated = NOW()
        WHERE item_id = p_item_id AND warehouse_id = p_warehouse_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get movement history (replaces sp_get_movement_history)
CREATE OR REPLACE FUNCTION sp_get_movement_history(p_item_id INTEGER)
RETURNS TABLE (
    movement_id INTEGER,
    movement_type CHAR(1),
    quantity INTEGER,
    reference VARCHAR(100),
    movement_date TEXT,
    username VARCHAR(50),
    warehouse_name VARCHAR(100),
    sku VARCHAR(50),
    item_name VARCHAR(200)
) AS $$
SELECT
    m.movement_id, m.movement_type, m.quantity, m.reference,
    m.movement_date::TEXT, m.username,
    w.warehouse_name, i.sku, i.item_name
FROM stock_movements m
JOIN warehouses w ON m.warehouse_id = w.warehouse_id
JOIN inventory_items i ON m.item_id = i.item_id
WHERE m.item_id = p_item_id
ORDER BY m.movement_date DESC;
$$ LANGUAGE sql;