package com.linmeng.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.linmeng.common.Result;
import com.linmeng.entity.MarketingActivity;
import com.linmeng.service.MarketingActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "营销活动", description = "营销活动管理相关接口")
@RestController
@RequestMapping("/activity")
public class ActivityController {
    
    @Autowired
    private MarketingActivityService activityService;
    
    @Operation(summary = "获取已发布活动列表")
    @GetMapping("/published")
    public Result<List<MarketingActivity>> published() {
        List<MarketingActivity> list = activityService.getPublishedActivities();
        return Result.success(list);
    }
    
    @Operation(summary = "获取商家的活动列表")
    @GetMapping("/merchant/{merchantId}")
    public Result<List<MarketingActivity>> byMerchant(@PathVariable Long merchantId) {
        List<MarketingActivity> list = activityService.getByMerchantId(merchantId);
        return Result.success(list);
    }
    
    @Operation(summary = "分页查询活动")
    @GetMapping("/page")
    public Result<Page<MarketingActivity>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer status) {
        Page<MarketingActivity> page = activityService.getPage(pageNum, pageSize, title, status);
        return Result.success(page);
    }
    
    @Operation(summary = "获取活动详情")
    @GetMapping("/{id}")
    public Result<MarketingActivity> detail(@PathVariable Long id) {
        MarketingActivity activity = activityService.getById(id);
        activityService.incrementViewCount(id);
        return Result.success(activity);
    }
    
    @Operation(summary = "发布活动")
    @PostMapping
    public Result<String> publish(@RequestBody MarketingActivity activity) {
        boolean success = activityService.publishActivity(activity);
        return success ? Result.success("发布成功") : Result.error("发布失败");
    }
    
    @Operation(summary = "更新活动")
    @PutMapping
    public Result<String> update(@RequestBody MarketingActivity activity) {
        boolean success = activityService.updateActivity(activity);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }
    
    @Operation(summary = "更新活动状态")
    @PutMapping("/{id}/status/{status}")
    public Result<String> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        boolean success = activityService.updateStatus(id, status);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }
    
    @Operation(summary = "点赞活动")
    @PostMapping("/{id}/like")
    public Result<String> like(@PathVariable Long id) {
        boolean success = activityService.incrementLikeCount(id);
        return success ? Result.success("点赞成功") : Result.error("点赞失败");
    }
    
    @Operation(summary = "分享活动")
    @PostMapping("/{id}/share")
    public Result<String> share(@PathVariable Long id) {
        boolean success = activityService.incrementShareCount(id);
        return success ? Result.success("分享成功") : Result.error("分享失败");
    }
}
