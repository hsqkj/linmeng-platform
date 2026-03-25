package com.linmeng.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.linmeng.common.Result;
import com.linmeng.entity.MerchantInfo;
import com.linmeng.service.MerchantInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "商家管理", description = "商家信息管理相关接口")
@RestController
@RequestMapping("/merchant")
public class MerchantController {
    
    @Autowired
    private MerchantInfoService merchantInfoService;
    
    @Operation(summary = "获取商家列表")
    @GetMapping("/list")
    public Result<List<MerchantInfo>> list() {
        List<MerchantInfo> list = merchantInfoService.getAllActive();
        return Result.success(list);
    }
    
    @Operation(summary = "分页查询商家")
    @GetMapping("/page")
    public Result<Page<MerchantInfo>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer industryId) {
        Page<MerchantInfo> page = merchantInfoService.getPage(pageNum, pageSize, name, industryId);
        return Result.success(page);
    }
    
    @Operation(summary = "获取商家详情")
    @GetMapping("/{id}")
    public Result<MerchantInfo> detail(@PathVariable Long id) {
        MerchantInfo merchantInfo = merchantInfoService.getById(id);
        return Result.success(merchantInfo);
    }
    
    @Operation(summary = "创建商家信息")
    @PostMapping
    public Result<String> create(@RequestBody MerchantInfo merchantInfo) {
        boolean success = merchantInfoService.createMerchant(merchantInfo);
        return success ? Result.success("创建成功") : Result.error("创建失败");
    }
    
    @Operation(summary = "更新商家信息")
    @PutMapping
    public Result<String> update(@RequestBody MerchantInfo merchantInfo) {
        boolean success = merchantInfoService.updateMerchant(merchantInfo);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }
    
    @Operation(summary = "更新商家状态")
    @PutMapping("/{id}/status/{status}")
    public Result<String> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        boolean success = merchantInfoService.updateStatus(id, status);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }
}
