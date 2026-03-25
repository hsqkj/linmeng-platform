package com.linmeng.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("merchant_accounts")
public class MerchantAccount implements Serializable {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String openid;
    
    private String unionid;
    
    private String phone;
    
    private String password;
    
    private String salt;
    
    private Integer loginType;
    
    private LocalDateTime lastLoginTime;
    
    private String lastLoginIp;
    
    private Integer loginCount;
    
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
