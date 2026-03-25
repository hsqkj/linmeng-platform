package com.linmeng.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.linmeng.entity.Order;
import java.util.List;

public interface OrderService extends IService<Order> {
    
    List<Order> getByUserId(Long userId);
    
    List<Order> getByMerchantId(Long merchantId);
    
    Page<Order> getPage(Integer pageNum, Integer pageSize, Integer status);
    
    boolean createOrder(Order order);
    
    boolean updateOrderStatus(Long id, Integer status);
    
    boolean cancelOrder(Long id, String cancelReason);
}
