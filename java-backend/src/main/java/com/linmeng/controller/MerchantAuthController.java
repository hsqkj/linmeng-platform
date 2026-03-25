package com.linmeng.controller;

import com.linmeng.common.Result;
import com.linmeng.dto.LoginDTO;
import com.linmeng.dto.RegisterDTO;
import com.linmeng.entity.MerchantAccount;
import com.linmeng.service.MerchantAccountService;
import com.linmeng.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "商家认证", description = "商家账号认证相关接口")
@RestController
@RequestMapping("/merchant/auth")
public class MerchantAuthController {
    
    @Autowired
    private MerchantAccountService merchantAccountService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Operation(summary = "商家注册")
    @PostMapping("/register")
    public Result<Map<String, Object>> register(@RequestBody RegisterDTO dto) {
        boolean success = merchantAccountService.register(dto.getPhone(), dto.getPassword());
        if (success) {
            MerchantAccount account = merchantAccountService.getByPhone(dto.getPhone());
            String token = jwtUtil.generateToken(account.getId().toString());
            Map<String, Object> result = new HashMap<>();
            result.put("token", token);
            result.put("merchantId", account.getId());
            return Result.success("注册成功", result);
        }
        return Result.error("注册失败");
    }
    
    @Operation(summary = "商家登录")
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginDTO dto) {
        MerchantAccount account = merchantAccountService.login(dto.getPhone(), dto.getPassword());
        String token = jwtUtil.generateToken(account.getId().toString());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("merchantId", account.getId());
        return Result.success("登录成功", result);
    }
    
    @Operation(summary = "获取商家信息")
    @GetMapping("/info")
    public Result<MerchantAccount> info(@RequestAttribute("merchantId") Long merchantId) {
        MerchantAccount account = merchantAccountService.getById(merchantId);
        account.setPassword(null);
        account.setSalt(null);
        return Result.success(account);
    }
}
