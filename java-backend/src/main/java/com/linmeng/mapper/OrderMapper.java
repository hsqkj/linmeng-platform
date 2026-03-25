package com.linmeng.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linmeng.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface OrderMapper extends BaseMapper<Order> {
    
    @Select("SELECT o.*, m.name as merchant_name, u.nickname as user_name, u.avatar as user_avatar " +
            "FROM orders o " +
            "LEFT JOIN merchant_info m ON o.merchant_id = m.merchant_id " +
            "LEFT JOIN resident_users u ON o.user_id = u.id " +
            "WHERE o.user_id = #{userId} " +
            "ORDER BY o.create_time DESC")
    List<Order> selectByUserId(Long userId);
    
    @Select("SELECT o.*, m.name as merchant_name, u.nickname as user_name, u.avatar as user_avatar " +
            "FROM orders o " +
            "LEFT JOIN merchant_info m ON o.merchant_id = m.merchant_id " +
            "LEFT JOIN resident_users u ON o.user_id = u.id " +
            "WHERE o.merchant_id = #{merchantId} " +
            "ORDER BY o.create_time DESC")
    List<Order> selectByMerchantId(Long merchantId);
}
