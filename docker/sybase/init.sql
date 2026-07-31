-- Sybase ASE init script for warehouse inventory database
-- This runs when the Sybase container starts

use master
go

-- Create warehouse database
if exists(select 1 from sysdatabases where name = 'warehouse')
    drop database warehouse
go

create database warehouse
go

use warehouse
go

-- Create warehouse_user
if exists(select 1 from sysusers where name = 'warehouse_user')
    exec sp_dropuser 'warehouse_user'
go

exec sp_adduser 'warehouse_user', 'warehouse_user', null
go

-- Grant permissions
grant create table to warehouse_user
go
grant create view to warehouse_user
go
grant create procedure to warehouse_user
go

-- =============================================
-- WAREHOUSE INVENTORY SCHEMA
-- =============================================

-- Categories table
create table categories (
    category_id   numeric(10,0) identity,
    category_name varchar(100) not null,
    description   varchar(255) null,
    constraint pk_categories primary key (category_id)
)
go

-- Warehouses table (physical locations)
create table warehouses (
    warehouse_id   numeric(10,0) identity,
    warehouse_name varchar(100) not null,
    location       varchar(255) not null,
    state_code     varchar(2)   not null,
    is_active      char(1)      default 'Y',
    constraint pk_warehouses primary key (warehouse_id)
)
go

-- Inventory items table
create table inventory_items (
    item_id       numeric(10,0) identity,
    sku           varchar(50)  not null,
    item_name     varchar(200) not null,
    category_id   numeric(10,0) null,
    description   varchar(500) null,
    unit_price    numeric(12,2) default 0,
    reorder_level int         default 0,
    constraint pk_inventory_items primary key (item_id),
    constraint uq_sku unique (sku),
    constraint fk_item_category foreign key (category_id) references categories (category_id)
)
go

-- Inventory stock table (tracks stock per warehouse)
create table inventory_stock (
    stock_id      numeric(10,0) identity,
    item_id       numeric(10,0) not null,
    warehouse_id  numeric(10,0) not null,
    quantity      int           not null default 0,
    last_updated  datetime      not null default getdate(),
    constraint pk_inventory_stock primary key (stock_id),
    constraint fk_stock_item      foreign key (item_id)      references inventory_items (item_id),
    constraint fk_stock_warehouse foreign key (warehouse_id) references warehouses (warehouse_id),
    constraint uq_stock_item_wh unique (item_id, warehouse_id)
)
go

-- Stock movements (audit trail)
create table stock_movements (
    movement_id   numeric(10,0) identity,
    item_id       numeric(10,0) not null,
    warehouse_id  numeric(10,0) not null,
    movement_type char(1)  not null,  -- 'I' = inbound, 'O' = outbound, 'T' = transfer
    quantity      int      not null,
    reference     varchar(100) null,
    movement_date datetime not null default getdate(),
    username      varchar(50) null,
    constraint pk_stock_movements primary key (movement_id),
    constraint fk_mvmt_item      foreign key (item_id)      references inventory_items (item_id),
    constraint fk_mvmt_warehouse  foreign key (warehouse_id) references warehouses (warehouse_id)
)
go

-- =============================================
-- SECURITY TABLES (for Elytron DatabaseServerLoginModule)
-- =============================================

create table users (
    username varchar(50) not null,
    password varchar(128) not null,
    constraint pk_users primary key (username)
)
go

create table user_roles (
    username varchar(50) not null,
    role     varchar(50) not null,
    constraint pk_user_roles primary key (username, role)
)
go

-- Seed security users (passwords are plain text for demo; in production use hashing)
insert into users (username, password) values
    ('admin', 'admin123!'),
    ('operator', 'operator123!'),
    ('viewer', 'viewer123!')
go

insert into user_roles (username, role) values
    ('admin', 'admin'),
    ('operator', 'operator'),
    ('viewer', 'viewer')
go

-- =============================================
-- SEED DATA
-- =============================================

insert into categories (category_name, description) values
    ('Electronics', 'Electronic components and devices'),
    ('Hardware', 'Screws, bolts, nuts, brackets'),
    ('Tools', 'Power tools and hand tools'),
    ('Office Supplies', 'Stationery and office consumables'),
    ('Safety Equipment', 'PPE and safety gear')
go

insert into warehouses (warehouse_name, location, state_code, is_active) values
    ('Norfolk Naval Base', 'Norfolk, VA', 'VA', 'Y'),
    ('San Diego Naval Base', 'San Diego, CA', 'CA', 'Y'),
    ('Pearl Harbor', 'Honolulu, HI', 'HI', 'Y'),
    ('Yokosuka Naval Base', 'Yokosuka, JP', 'JP', 'Y')
go

insert into inventory_items (sku, item_name, category_id, description, unit_price, reorder_level) values
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
go

-- Stock for each item across warehouses
insert into inventory_stock (item_id, warehouse_id, quantity) values
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
go

-- Sample stock movements
insert into stock_movements (item_id, warehouse_id, movement_type, quantity, reference, username) values
    (1, 1, 'I', 125, 'PO-2026-001', 'admin'),
    (1, 2, 'I', 100, 'PO-2026-002', 'admin'),
    (1, 2, 'O', 20, 'REQ-2026-045', 'operator'),
    (3, 1, 'I', 1000, 'PO-2026-003', 'admin'),
    (3, 1, 'O', 250, 'REQ-2026-046', 'operator'),
    (5, 1, 'I', 10, 'PO-2026-004', 'admin'),
    (5, 1, 'O', 2, 'REQ-2026-047', 'operator')
go

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Get all inventory with warehouse and category info
create procedure sp_get_all_inventory as
begin
    select
        i.item_id,
        i.sku,
        i.item_name,
        c.category_name,
        i.unit_price,
        i.reorder_level,
        w.warehouse_name,
        w.state_code,
        s.quantity,
        s.last_updated
    from inventory_items i
    left join categories c on i.category_id = c.category_id
    left join inventory_stock s on i.item_id = s.item_id
    left join warehouses w on s.warehouse_id = w.warehouse_id
    order by i.sku, w.warehouse_name
end
go

-- Get low stock items (below reorder level)
create procedure sp_get_low_stock as
begin
    select
        i.sku,
        i.item_name,
        i.reorder_level,
        s.quantity,
        w.warehouse_name,
        w.state_code
    from inventory_items i
    join inventory_stock s on i.item_id = s.item_id
    join warehouses w on s.warehouse_id = w.warehouse_id
    where s.quantity < i.reorder_level
    order by i.sku
end
go

-- Get inventory summary by warehouse
create procedure sp_get_warehouse_summary as
begin
    select
        w.warehouse_name,
        w.state_code,
        count(distinct i.item_id) as total_items,
        sum(s.quantity) as total_units,
        sum(s.quantity * i.unit_price) as total_value
    from warehouses w
    left join inventory_stock s on w.warehouse_id = s.warehouse_id
    left join inventory_items i on s.item_id = i.item_id
    group by w.warehouse_name, w.state_code
    order by w.warehouse_name
end
go

-- Add stock movement (inbound or outbound)
create procedure sp_add_movement
    @item_id numeric(10,0),
    @warehouse_id numeric(10,0),
    @movement_type char(1),
    @quantity int,
    @reference varchar(100),
    @username varchar(50)
as
begin
    -- Record the movement
    insert into stock_movements (item_id, warehouse_id, movement_type, quantity, reference, username)
    values (@item_id, @warehouse_id, @movement_type, @quantity, @reference, @username)

    -- Update stock level
    if @movement_type = 'I'
        update inventory_stock
        set quantity = quantity + @quantity, last_updated = getdate()
        where item_id = @item_id and warehouse_id = @warehouse_id
    else if @movement_type = 'O'
        update inventory_stock
        set quantity = quantity - @quantity, last_updated = getdate()
        where item_id = @item_id and warehouse_id = @warehouse_id
end
go

-- Get stock movement history for an item
create procedure sp_get_movement_history
    @item_id numeric(10,0)
as
begin
    select
        m.movement_id,
        m.movement_type,
        m.quantity,
        m.reference,
        m.movement_date,
        m.username,
        w.warehouse_name
    from stock_movements m
    join warehouses w on m.warehouse_id = w.warehouse_id
    where m.item_id = @item_id
    order by m.movement_date desc
end
go

print 'Warehouse inventory database initialized successfully.'
go