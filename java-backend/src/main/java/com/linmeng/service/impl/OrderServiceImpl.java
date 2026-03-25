package com.linmeng.service.impl;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.linmeng.entity.Order;
import com.linmeng.mapper.OrderMapper;
import com.linmeng.service.OrderService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {
    
    @Override
    public List<Order> getByUserId(Long userId) {
        return baseMapper.selectByUserId(userId);
    }
    
    @Override
    public List<Order> getByMerchantId(Long merchantId) {
        return baseMapper.selectByMerchantId(merchantId);
    }
    
    @Override
    public Page<Order> getPage(Integer pageNum, Integer pageSize, Integer status) {
        Page<Order> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        
        if (status != null) {
            wrapper.eq(Order::getStatus, status);
        }
        
        wrapper.orderByDesc(Order::getCreateTime);
        return page(page, wrapper);
    }
    
    @Override
    public boolean createOrder(Order order) {
        order.setOrderNo("NO" + IdUtil.getSnowflakeNextIdStr());
        order.setStatus(0);
        return save(order);
    }
    
    @Override
    public boolean updateOrderStatus(Long id, Integer status) {
        Order order = new Order();
        order.setId(id);
        order.setStatus(status);
        
        if (status == 3) {
            order.setCompleteTime(LocalDateTime.now());
        }
        
        return updateById(order);
    }
    
    @Override
    public boolean cancelOrder(Long id, String cancelReason) {
        Order order = new Order();
        order.setId(id);
        order.setStatus(4);
        order.setCancelReason(cancelReason);
        order.setCancelTime(LocalDateTime.now());
        return updateById(order);
    }
}
