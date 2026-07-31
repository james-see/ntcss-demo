package com.warehouse.controller;

public class StockMovementRequest {
    private int itemId;
    private int warehouseId;
    private String movementType;
    private int quantity;
    private String reference;
    private String username;

    public int getItemId() { return itemId; }
    public void setItemId(int itemId) { this.itemId = itemId; }
    public int getWarehouseId() { return warehouseId; }
    public void setWarehouseId(int warehouseId) { this.warehouseId = warehouseId; }
    public String getMovementType() { return movementType; }
    public void setMovementType(String movementType) { this.movementType = movementType; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}