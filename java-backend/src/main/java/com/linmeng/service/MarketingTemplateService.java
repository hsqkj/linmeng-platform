package com.linmeng.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.linmeng.entity.MarketingTemplate;
import java.util.List;

public interface MarketingTemplateService extends IService<MarketingTemplate> {
    
    List<MarketingTemplate> getAllActive();
}
