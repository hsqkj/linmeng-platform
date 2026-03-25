package com.linmeng.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linmeng.entity.MerchantInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface MerchantInfoMapper extends BaseMapper<MerchantInfo> {
    
    @Select("SELECT mi.*, i.name as industry_name, c.name as community_name " +
            "FROM merchant_info mi " +
            "LEFT JOIN industries i ON mi.industry_id = i.id " +
            "LEFT JOIN communities c ON mi.community_id = c.id " +
            "WHERE mi.merchant_id = #{merchantId}")
    MerchantInfo selectByMerchantId(Long merchantId);
    
    @Select("SELECT mi.*, i.name as industry_name, c.name as community_name " +
            "FROM merchant_info mi " +
            "LEFT JOIN industries i ON mi.industry_id = i.id " +
            "LEFT JOIN communities c ON mi.community_id = c.id " +
            "WHERE mi.status = 1 " +
            "ORDER BY mi.rating DESC, mi.create_time DESC")
    List<MerchantInfo> selectAllActive();
}
