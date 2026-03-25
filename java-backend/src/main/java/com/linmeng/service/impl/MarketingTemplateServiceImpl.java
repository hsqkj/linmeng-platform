package com.linmeng.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.linmeng.entity.MarketingTemplate;
import com.linmeng.mapper.MarketingTemplateMapper;
import com.linmeng.service.MarketingTemplateService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MarketingTemplateServiceImpl extends ServiceImpl<MarketingTemplateMapper, MarketingTemplate> implements MarketingTemplateService {
    
    @Override
    public List<MarketingTemplate> getAllActive() {
        return baseMapper.selectAllActive();
    }
}
