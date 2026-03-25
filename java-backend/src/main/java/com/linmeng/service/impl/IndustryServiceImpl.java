package com.linmeng.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.linmeng.entity.Industry;
import com.linmeng.mapper.IndustryMapper;
import com.linmeng.service.IndustryService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class IndustryServiceImpl extends ServiceImpl<IndustryMapper, Industry> implements IndustryService {
    
    @Override
    public List<Industry> getAllActive() {
        return baseMapper.selectAllActive();
    }
}
