package com.linmeng.controller;

import com.linmeng.common.Result;
import com.linmeng.entity.Community;
import com.linmeng.service.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "社区管理", description = "社区相关接口")
@RestController
@RequestMapping("/community")
public class CommunityController {
    
    @Autowired
    private CommunityService communityService;
    
    @Operation(summary = "获取所有社区")
    @GetMapping("/list")
    public Result<List<Community>> list() {
        List<Community> list = communityService.getAllActive();
        return Result.success(list);
    }
    
    @Operation(summary = "获取社区详情")
    @GetMapping("/{id}")
    public Result<Community> detail(@PathVariable Integer id) {
        Community community = communityService.getById(id);
        return Result.success(community);
    }
}
