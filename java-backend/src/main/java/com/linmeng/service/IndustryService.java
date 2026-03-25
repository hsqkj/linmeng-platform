package com.linmeng.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.linmeng.entity.Industry;
import java.util.List;

public interface IndustryService extends IService<Industry> {
    
    List<Industry> getAllActive();
}
