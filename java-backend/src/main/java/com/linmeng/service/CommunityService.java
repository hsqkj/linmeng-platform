package com.linmeng.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.linmeng.entity.Community;
import java.util.List;

public interface CommunityService extends IService<Community> {
    
    List<Community> getAllActive();
}
