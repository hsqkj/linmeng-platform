package com.linmeng.controller;

import com.linmeng.common.Result;
import com.linmeng.entity.MarketingTemplate;
import com.linmeng.service.MarketingTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "营销模板", description = "营销模板相关接口")
@RestController
@RequestMapping("/template")
public class TemplateController {
    
    @Autowired
    private MarketingTemplateService templateService;
    
    @Operation(summary = "获取所有营销模板")
    @GetMapping("/list")
    public Result<List<MarketingTemplate>> list() {
        List<MarketingTemplate> list = templateService.getAllActive();
        return Result.success(list);
    }
    
    @Operation(summary = "获取模板详情")
    @GetMapping("/{id}")
    public Result<MarketingTemplate> detail(@PathVariable Integer id) {
        MarketingTemplate template = templateService.getById(id);
        return Result.success(template);
    }
}
