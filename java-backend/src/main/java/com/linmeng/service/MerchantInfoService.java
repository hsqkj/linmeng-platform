package com.linmeng.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.linmeng.entity.MerchantInfo;
import java.util.List;

public interface MerchantInfoService extends IService<MerchantInfo> {
    
    MerchantInfo getByMerchantId(Long merchantId);
    
    List<MerchantInfo> getAllActive();
    
    Page<MerchantInfo> getPage(Integer pageNum, Integer pageSize, String name, Integer industryId);
    
    boolean createMerchant(MerchantInfo merchantInfo);
    
    boolean updateMerchant(MerchantInfo merchantInfo);
    
    boolean updateStatus(Long id, Integer status);
}
