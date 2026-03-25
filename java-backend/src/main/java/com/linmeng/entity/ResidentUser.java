package com.linmeng.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("resident_users")
public class ResidentUser implements Serializable {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String openid;
    
    private String unionid;
    
    private String phone;
    
    private String nickname;
    
    private String avatar;
    
    private Integer gender;
    
    private LocalDateTime birthday;
    
    private Integer communityId;
    
    private String address;
    
    private Integer memberLevel;
    
    private Integer points;
    
    private BigDecimal balance;
    
    private LocalDateTime lastLoginTime;
    
    private String lastLoginIp;
    
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
