package com.warehouse.controller;

import com.warehouse.model.*;
import com.warehouse.service.WarehouseService;

import javax.annotation.security.RolesAllowed;
import javax.annotation.security.PermitAll;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InventoryController {

    private WarehouseService service = new WarehouseService();

    // --- Inventory Endpoints ---

    @GET
    @Path("/inventory")
    @RolesAllowed({"admin", "operator", "viewer"})
    public Response getAllInventory() {
        try {
            List<WarehouseStock> items = service.getAllInventory();
            return Response.ok(items).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}").build();
        }
    }

    @GET
    @Path("/inventory/low-stock")
    @RolesAllowed({"admin", "operator"})
    public Response getLowStock() {
        try {
            List<WarehouseStock> items = service.getLowStock();
            return Response.ok(items).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}").build();
        }
    }

    // --- Warehouse Endpoints ---

    @GET
    @Path("/warehouses")
    @RolesAllowed({"admin", "operator", "viewer"})
    public Response getWarehouses() {
        try {
            List<Warehouse> warehouses = service.getWarehouses();
            return Response.ok(warehouses).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}").build();
        }
    }

    @GET
    @Path("/warehouses/summary")
    @RolesAllowed({"admin", "operator", "viewer"})
    public Response getWarehouseSummary() {
        try {
            List<WarehouseSummary> summary = service.getWarehouseSummary();
            return Response.ok(summary).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}").build();
        }
    }

    // --- Stock Movement Endpoints ---

    @GET
    @Path("/movements/{itemId}")
    @RolesAllowed({"admin", "operator", "viewer"})
    public Response getMovementHistory(@PathParam("itemId") int itemId) {
        try {
            List<StockMovement> movements = service.getMovementHistory(itemId);
            return Response.ok(movements).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}").build();
        }
    }

    @POST
    @Path("/movements")
    @RolesAllowed({"admin", "operator"})
    public Response addStockMovement(StockMovementRequest request) {
        try {
            boolean success = service.addStockMovement(
                request.getItemId(),
                request.getWarehouseId(),
                request.getMovementType(),
                request.getQuantity(),
                request.getReference(),
                request.getUsername()
            );
            if (success) {
                return Response.ok("{\"status\": \"success\", \"message\": \"Stock movement recorded\"}").build();
            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\": \"Failed to record movement\"}").build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}").build();
        }
    }

    // --- Health Check ---

    @GET
    @Path("/health")
    @PermitAll
    public Response health() {
        return Response.ok("{\"status\": \"UP\", \"service\": \"warehouse-inventory\", \"backend\": \"WildFly/Elytron\"}").build();
    }
}