package com.linmeng.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linmeng.entity.MarketingTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface MarketingTemplateMapper extends BaseMapper<MarketingTemplate> {
    
    @Select("SELECT * FROM marketing_templates WHERE status = 1 ORDER BY sort_order ASC")
    List<MarketingTemplate> selectAllActive();
}
