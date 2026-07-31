package com.warehouse.model;

import java.math.BigDecimal;

public class InventoryItem {
    private int itemId;
    private String sku;
    private String itemName;
    private String categoryName;
    private String description;
    private BigDecimal unitPrice;
    private int reorderLevel;

    // Default constructor
    public InventoryItem() {}

    public InventoryItem(int itemId, String sku, String itemName, String categoryName,
                         String description, BigDecimal unitPrice, int reorderLevel) {
        this.itemId = itemId;
        this.sku = sku;
        this.itemName = itemName;
        this.categoryName = categoryName;
        this.description = description;
        this.unitPrice = unitPrice;
        this.reorderLevel = reorderLevel;
    }

    // Getters and setters
    public int getItemId() { return itemId; }
    public void setItemId(int itemId) { this.itemId = itemId; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public int getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(int reorderLevel) { this.reorderLevel = reorderLevel; }
}