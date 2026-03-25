package com.linmeng.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.linmeng.entity.MarketingActivity;
import java.util.List;

public interface MarketingActivityService extends IService<MarketingActivity> {
    
    List<MarketingActivity> getPublishedActivities();
    
    List<MarketingActivity> getByMerchantId(Long merchantId);
    
    Page<MarketingActivity> getPage(Integer pageNum, Integer pageSize, String title, Integer status);
    
    boolean publishActivity(MarketingActivity activity);
    
    boolean updateActivity(MarketingActivity activity);
    
    boolean updateStatus(Long id, Integer status);
    
    boolean incrementViewCount(Long id);
    
    boolean incrementLikeCount(Long id);
    
    boolean incrementShareCount(Long id);
}
