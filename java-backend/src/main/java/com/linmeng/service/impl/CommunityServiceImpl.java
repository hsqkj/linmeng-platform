package com.linmeng.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.linmeng.entity.Community;
import com.linmeng.mapper.CommunityMapper;
import com.linmeng.service.CommunityService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CommunityServiceImpl extends ServiceImpl<CommunityMapper, Community> implements CommunityService {
    
    @Override
    public List<Community> getAllActive() {
        return baseMapper.selectAllActive();
    }
}
