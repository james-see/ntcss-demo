package com.warehouse.service;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class WarehouseService {

    private static final Logger logger = Logger.getLogger(WarehouseService.class.getName());
    private static final String JNDI_DS = "java:/jdbc/warehouseDS";

    private DataSource getDataSource() throws Exception {
        Context ctx = new InitialContext();
        return (DataSource) ctx.lookup(JNDI_DS);
    }

    public List<com.warehouse.model.WarehouseStock> getAllInventory() throws Exception {
        List<com.warehouse.model.WarehouseStock> list = new ArrayList<>();
        String sql = "SELECT i.item_id, i.sku, i.item_name, c.category_name, " +
                     "i.unit_price, i.reorder_level, w.warehouse_name, w.state_code, " +
                     "s.quantity, s.last_updated::text as last_updated " +
                     "FROM inventory_items i " +
                     "LEFT JOIN categories c ON i.category_id = c.category_id " +
                     "LEFT JOIN inventory_stock s ON i.item_id = s.item_id " +
                     "LEFT JOIN warehouses w ON s.warehouse_id = w.warehouse_id " +
                     "ORDER BY i.sku, w.warehouse_name";

        try (Connection conn = getDataSource().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                com.warehouse.model.WarehouseStock item = new com.warehouse.model.WarehouseStock();
                item.setItemId(rs.getInt("item_id"));
                item.setSku(rs.getString("sku"));
                item.setItemName(rs.getString("item_name"));
                item.setCategoryName(rs.getString("category_name"));
                item.setWarehouseName(rs.getString("warehouse_name"));
                item.setStateCode(rs.getString("state_code"));
                int qty = rs.getInt("quantity");
                item.setQuantity(qty);
                int reorder = rs.getInt("reorder_level");
                item.setReorderLevel(reorder);
                item.setUnitPrice(rs.getBigDecimal("unit_price"));
                if (item.getUnitPrice() != null) {
                    item.setTotalValue(item.getUnitPrice().multiply(new java.math.BigDecimal(qty)));
                }
                item.setLastUpdated(rs.getString("last_updated"));
                item.setLowStock(qty < reorder);
                list.add(item);
            }
        }
        logger.info("Retrieved " + list.size() + " inventory records");
        return list;
    }

    public List<com.warehouse.model.WarehouseStock> getLowStock() throws Exception {
        List<com.warehouse.model.WarehouseStock> list = new ArrayList<>();
        String sql = "SELECT i.item_id, i.sku, i.item_name, c.category_name, " +
                     "i.unit_price, i.reorder_level, w.warehouse_name, w.state_code, " +
                     "s.quantity, s.last_updated::text as last_updated " +
                     "FROM inventory_items i " +
                     "JOIN categories c ON i.category_id = c.category_id " +
                     "JOIN inventory_stock s ON i.item_id = s.item_id " +
                     "JOIN warehouses w ON s.warehouse_id = w.warehouse_id " +
                     "WHERE s.quantity < i.reorder_level " +
                     "ORDER BY i.sku, w.warehouse_name";

        try (Connection conn = getDataSource().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                com.warehouse.model.WarehouseStock item = new com.warehouse.model.WarehouseStock();
                item.setItemId(rs.getInt("item_id"));
                item.setSku(rs.getString("sku"));
                item.setItemName(rs.getString("item_name"));
                item.setCategoryName(rs.getString("category_name"));
                item.setWarehouseName(rs.getString("warehouse_name"));
                item.setStateCode(rs.getString("state_code"));
                int qty = rs.getInt("quantity");
                item.setQuantity(qty);
                int reorder = rs.getInt("reorder_level");
                item.setReorderLevel(reorder);
                item.setUnitPrice(rs.getBigDecimal("unit_price"));
                if (item.getUnitPrice() != null) {
                    item.setTotalValue(item.getUnitPrice().multiply(new java.math.BigDecimal(qty)));
                }
                item.setLastUpdated(rs.getString("last_updated"));
                item.setLowStock(true);
                list.add(item);
            }
        }
        logger.info("Retrieved " + list.size() + " low stock items");
        return list;
    }

    public List<com.warehouse.model.Warehouse> getWarehouses() throws Exception {
        List<com.warehouse.model.Warehouse> list = new ArrayList<>();
        String sql = "SELECT warehouse_id, warehouse_name, location, state_code, is_active " +
                     "FROM warehouses ORDER BY warehouse_name";

        try (Connection conn = getDataSource().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                com.warehouse.model.Warehouse w = new com.warehouse.model.Warehouse();
                w.setWarehouseId(rs.getInt("warehouse_id"));
                w.setWarehouseName(rs.getString("warehouse_name"));
                w.setLocation(rs.getString("location"));
                w.setStateCode(rs.getString("state_code"));
                w.setIsActive(rs.getString("is_active"));
                list.add(w);
            }
        }
        return list;
    }

    public List<com.warehouse.model.WarehouseSummary> getWarehouseSummary() throws Exception {
        List<com.warehouse.model.WarehouseSummary> list = new ArrayList<>();
        String sql = "SELECT w.warehouse_name, w.state_code, " +
                     "COUNT(DISTINCT i.item_id) AS total_items, " +
                     "COALESCE(SUM(s.quantity), 0) AS total_units, " +
                     "COALESCE(SUM(s.quantity * i.unit_price), 0) AS total_value " +
                     "FROM warehouses w " +
                     "LEFT JOIN inventory_stock s ON w.warehouse_id = s.warehouse_id " +
                     "LEFT JOIN inventory_items i ON s.item_id = i.item_id " +
                     "GROUP BY w.warehouse_name, w.state_code " +
                     "ORDER BY w.warehouse_name";

        try (Connection conn = getDataSource().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                com.warehouse.model.WarehouseSummary ws = new com.warehouse.model.WarehouseSummary();
                ws.setWarehouseName(rs.getString("warehouse_name"));
                ws.setStateCode(rs.getString("state_code"));
                ws.setTotalItems(rs.getInt("total_items"));
                ws.setTotalUnits(rs.getInt("total_units"));
                ws.setTotalValue(rs.getBigDecimal("total_value"));
                list.add(ws);
            }
        }
        return list;
    }

    public List<com.warehouse.model.StockMovement> getMovementHistory(int itemId) throws Exception {
        List<com.warehouse.model.StockMovement> list = new ArrayList<>();
        String sql = "SELECT m.movement_id, m.movement_type, m.quantity, m.reference, " +
                     "m.movement_date::text as movement_date, m.username, " +
                     "w.warehouse_name, i.sku, i.item_name " +
                     "FROM stock_movements m " +
                     "JOIN warehouses w ON m.warehouse_id = w.warehouse_id " +
                     "JOIN inventory_items i ON m.item_id = i.item_id " +
                     "WHERE m.item_id = ? " +
                     "ORDER BY m.movement_date DESC";

        try (Connection conn = getDataSource().getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, itemId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    com.warehouse.model.StockMovement mv = new com.warehouse.model.StockMovement();
                    mv.setMovementId(rs.getInt("movement_id"));
                    mv.setMovementType(rs.getString("movement_type"));
                    mv.setQuantity(rs.getInt("quantity"));
                    mv.setReference(rs.getString("reference"));
                    mv.setMovementDate(rs.getString("movement_date"));
                    mv.setUsername(rs.getString("username"));
                    mv.setWarehouseName(rs.getString("warehouse_name"));
                    mv.setSku(rs.getString("sku"));
                    mv.setItemName(rs.getString("item_name"));
                    mv.setItemId(itemId);
                    list.add(mv);
                }
            }
        }
        return list;
    }

    public boolean addStockMovement(int itemId, int warehouseId, String movementType,
                                    int quantity, String reference, String username) throws Exception {
        // Use the stored function sp_add_movement, or inline the logic
        String insertSql = "INSERT INTO stock_movements (item_id, warehouse_id, movement_type, quantity, reference, username) " +
                           "VALUES (?, ?, ?, ?, ?, ?)";
        String updateSql = null;
        if ("I".equals(movementType)) {
            updateSql = "UPDATE inventory_stock SET quantity = quantity + ?, last_updated = NOW() WHERE item_id = ? AND warehouse_id = ?";
        } else if ("O".equals(movementType)) {
            updateSql = "UPDATE inventory_stock SET quantity = quantity - ?, last_updated = NOW() WHERE item_id = ? AND warehouse_id = ?";
        }

        try (Connection conn = getDataSource().getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                ps.setInt(1, itemId);
                ps.setInt(2, warehouseId);
                ps.setString(3, movementType);
                ps.setInt(4, quantity);
                ps.setString(5, reference);
                ps.setString(6, username);
                ps.executeUpdate();
            }

            if (updateSql != null) {
                try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                    ps.setInt(1, quantity);
                    ps.setInt(2, itemId);
                    ps.setInt(3, warehouseId);
                    ps.executeUpdate();
                }
            }

            conn.commit();
            logger.info("Added stock movement: item=" + itemId + " type=" + movementType +
                       " qty=" + quantity + " ref=" + reference + " by=" + username);
            return true;
        }
    }
}