package com.linmeng.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.linmeng.entity.MerchantAccount;

public interface MerchantAccountService extends IService<MerchantAccount> {
    
    MerchantAccount getByPhone(String phone);
    
    MerchantAccount getByOpenid(String openid);
    
    boolean register(String phone, String password);
    
    MerchantAccount login(String phone, String password);
}
