package com.linmeng.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.linmeng.entity.MarketingActivity;
import com.linmeng.mapper.MarketingActivityMapper;
import com.linmeng.service.MarketingActivityService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MarketingActivityServiceImpl extends ServiceImpl<MarketingActivityMapper, MarketingActivity> implements MarketingActivityService {
    
    @Override
    public List<MarketingActivity> getPublishedActivities() {
        return baseMapper.selectPublishedActivities();
    }
    
    @Override
    public List<MarketingActivity> getByMerchantId(Long merchantId) {
        return baseMapper.selectByMerchantId(merchantId);
    }
    
    @Override
    public Page<MarketingActivity> getPage(Integer pageNum, Integer pageSize, String title, Integer status) {
        Page<MarketingActivity> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<MarketingActivity> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(title)) {
            wrapper.like(MarketingActivity::getTitle, title);
        }
        
        if (status != null) {
            wrapper.eq(MarketingActivity::getStatus, status);
        }
        
        wrapper.orderByDesc(MarketingActivity::getCreateTime);
        return page(page, wrapper);
    }
    
    @Override
    public boolean publishActivity(MarketingActivity activity) {
        activity.setStatus(1);
        activity.setPublishTime(LocalDateTime.now());
        activity.setViewCount(0);
        activity.setLikeCount(0);
        activity.setShareCount(0);
        activity.setCommentCount(0);
        activity.setCollectionCount(0);
        activity.setOrderCount(0);
        return save(activity);
    }
    
    @Override
    public boolean updateActivity(MarketingActivity activity) {
        return updateById(activity);
    }
    
    @Override
    public boolean updateStatus(Long id, Integer status) {
        MarketingActivity activity = new MarketingActivity();
        activity.setId(id);
        activity.setStatus(status);
        return updateById(activity);
    }
    
    @Override
    public boolean incrementViewCount(Long id) {
        MarketingActivity activity = getById(id);
        if (activity != null) {
            activity.setViewCount(activity.getViewCount() + 1);
            return updateById(activity);
        }
        return false;
    }
    
    @Override
    public boolean incrementLikeCount(Long id) {
        MarketingActivity activity = getById(id);
        if (activity != null) {
            activity.setLikeCount(activity.getLikeCount() + 1);
            return updateById(activity);
        }
        return false;
    }
    
    @Override
    public boolean incrementShareCount(Long id) {
        MarketingActivity activity = getById(id);
        if (activity != null) {
            activity.setShareCount(activity.getShareCount() + 1);
            return updateById(activity);
        }
        return false;
    }
}
