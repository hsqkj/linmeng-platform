package com.linmeng.service.impl;

import cn.hutool.crypto.digest.DigestUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.linmeng.entity.MerchantAccount;
import com.linmeng.mapper.MerchantAccountMapper;
import com.linmeng.service.MerchantAccountService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class MerchantAccountServiceImpl extends ServiceImpl<MerchantAccountMapper, MerchantAccount> implements MerchantAccountService {
    
    @Override
    public MerchantAccount getByPhone(String phone) {
        return getOne(new LambdaQueryWrapper<MerchantAccount>()
                .eq(MerchantAccount::getPhone, phone));
    }
    
    @Override
    public MerchantAccount getByOpenid(String openid) {
        return getOne(new LambdaQueryWrapper<MerchantAccount>()
                .eq(MerchantAccount::getOpenid, openid));
    }
    
    @Override
    public boolean register(String phone, String password) {
        MerchantAccount existAccount = getByPhone(phone);
        if (existAccount != null) {
            throw new RuntimeException("手机号已注册");
        }
        
        MerchantAccount account = new MerchantAccount();
        account.setPhone(phone);
        String salt = UUID.randomUUID().toString().substring(0, 8);
        account.setSalt(salt);
        account.setPassword(DigestUtil.md5Hex(password + salt));
        account.setLoginType(1);
        account.setLoginCount(1);
        account.setLastLoginTime(LocalDateTime.now());
        account.setStatus(1);
        
        return save(account);
    }
    
    @Override
    public MerchantAccount login(String phone, String password) {
        MerchantAccount account = getByPhone(phone);
        if (account == null) {
            throw new RuntimeException("账号不存在");
        }
        
        String encryptedPassword = DigestUtil.md5Hex(password + account.getSalt());
        if (!encryptedPassword.equals(account.getPassword())) {
            throw new RuntimeException("密码错误");
        }
        
        if (account.getStatus() != 1) {
            throw new RuntimeException("账号已被禁用");
        }
        
        account.setLoginCount(account.getLoginCount() + 1);
        account.setLastLoginTime(LocalDateTime.now());
        updateById(account);
        
        return account;
    }
}
