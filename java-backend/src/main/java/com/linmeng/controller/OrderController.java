package com.linmeng.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.linmeng.common.Result;
import com.linmeng.entity.Order;
import com.linmeng.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "订单管理", description = "订单管理相关接口")
@RestController
@RequestMapping("/order")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Operation(summary = "获取用户订单列表")
    @GetMapping("/user/{userId}")
    public Result<List<Order>> byUser(@PathVariable Long userId) {
        List<Order> list = orderService.getByUserId(userId);
        return Result.success(list);
    }
    
    @Operation(summary = "获取商家订单列表")
    @GetMapping("/merchant/{merchantId}")
    public Result<List<Order>> byMerchant(@PathVariable Long merchantId) {
        List<Order> list = orderService.getByMerchantId(merchantId);
        return Result.success(list);
    }
    
    @Operation(summary = "分页查询订单")
    @GetMapping("/page")
    public Result<Page<Order>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status) {
        Page<Order> page = orderService.getPage(pageNum, pageSize, status);
        return Result.success(page);
    }
    
    @Operation(summary = "获取订单详情")
    @GetMapping("/{id}")
    public Result<Order> detail(@PathVariable Long id) {
        Order order = orderService.getById(id);
        return Result.success(order);
    }
    
    @Operation(summary = "创建订单")
    @PostMapping
    public Result<String> create(@RequestBody Order order) {
        boolean success = orderService.createOrder(order);
        return success ? Result.success("创建成功") : Result.error("创建失败");
    }
    
    @Operation(summary = "更新订单状态")
    @PutMapping("/{id}/status/{status}")
    public Result<String> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        boolean success = orderService.updateOrderStatus(id, status);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }
    
    @Operation(summary = "取消订单")
    @PostMapping("/{id}/cancel")
    public Result<String> cancel(@PathVariable Long id, @RequestParam String cancelReason) {
        boolean success = orderService.cancelOrder(id, cancelReason);
        return success ? Result.success("取消成功") : Result.error("取消失败");
    }
}
