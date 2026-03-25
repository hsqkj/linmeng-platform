package com.linmeng.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.linmeng.entity.MerchantInfo;
import com.linmeng.mapper.MerchantInfoMapper;
import com.linmeng.service.MerchantInfoService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import java.util.List;

@Service
public class MerchantInfoServiceImpl extends ServiceImpl<MerchantInfoMapper, MerchantInfo> implements MerchantInfoService {
    
    @Override
    public MerchantInfo getByMerchantId(Long merchantId) {
        return baseMapper.selectByMerchantId(merchantId);
    }
    
    @Override
    public List<MerchantInfo> getAllActive() {
        return baseMapper.selectAllActive();
    }
    
    @Override
    public Page<MerchantInfo> getPage(Integer pageNum, Integer pageSize, String name, Integer industryId) {
        Page<MerchantInfo> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<MerchantInfo> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(name)) {
            wrapper.like(MerchantInfo::getName, name);
        }
        
        if (industryId != null) {
            wrapper.eq(MerchantInfo::getIndustryId, industryId);
        }
        
        wrapper.orderByDesc(MerchantInfo::getCreateTime);
        return page(page, wrapper);
    }
    
    @Override
    public boolean createMerchant(MerchantInfo merchantInfo) {
        return save(merchantInfo);
    }
    
    @Override
    public boolean updateMerchant(MerchantInfo merchantInfo) {
        return updateById(merchantInfo);
    }
    
    @Override
    public boolean updateStatus(Long id, Integer status) {
        MerchantInfo merchantInfo = new MerchantInfo();
        merchantInfo.setId(id);
        merchantInfo.setStatus(status);
        return updateById(merchantInfo);
    }
}
