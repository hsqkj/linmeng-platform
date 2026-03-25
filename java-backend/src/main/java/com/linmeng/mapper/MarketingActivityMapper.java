package com.linmeng.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linmeng.entity.MarketingActivity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface MarketingActivityMapper extends BaseMapper<MarketingActivity> {
    
    @Select("SELECT a.*, m.name as merchant_name, m.logo as merchant_logo, " +
            "m.rating as merchant_rating, m.address as merchant_address " +
            "FROM marketing_activities a " +
            "INNER JOIN merchant_info m ON a.merchant_id = m.merchant_id " +
            "WHERE a.status = 1 " +
            "ORDER BY a.is_top DESC, a.publish_time DESC")
    List<MarketingActivity> selectPublishedActivities();
    
    @Select("SELECT a.*, m.name as merchant_name, m.logo as merchant_logo, " +
            "m.rating as merchant_rating, m.address as merchant_address " +
            "FROM marketing_activities a " +
            "INNER JOIN merchant_info m ON a.merchant_id = m.merchant_id " +
            "WHERE a.merchant_id = #{merchantId} " +
            "ORDER BY a.create_time DESC")
    List<MarketingActivity> selectByMerchantId(Long merchantId);
}
