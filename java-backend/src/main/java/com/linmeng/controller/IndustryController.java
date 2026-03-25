package com.linmeng.controller;

import com.linmeng.common.Result;
import com.linmeng.entity.Industry;
import com.linmeng.service.IndustryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "行业分类", description = "行业分类相关接口")
@RestController
@RequestMapping("/industry")
public class IndustryController {
    
    @Autowired
    private IndustryService industryService;
    
    @Operation(summary = "获取所有行业分类")
    @GetMapping("/list")
    public Result<List<Industry>> list() {
        List<Industry> list = industryService.getAllActive();
        return Result.success(list);
    }
    
    @Operation(summary = "获取行业详情")
    @GetMapping("/{id}")
    public Result<Industry> detail(@PathVariable Integer id) {
        Industry industry = industryService.getById(id);
        return Result.success(industry);
    }
}
