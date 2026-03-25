package com.linmeng.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("merchant_info")
public class MerchantInfo implements Serializable {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long merchantId;
    
    private String name;
    
    private String logo;
    
    private String coverImage;
    
    private String contactName;
    
    private String contactPhone;
    
    private Integer industryId;
    
    private Integer communityId;
    
    private String address;
    
    private BigDecimal latitude;
    
    private BigDecimal longitude;
    
    private String businessHours;
    
    private String businessLicense;
    
    private String licenseNo;
    
    private String description;
    
    private String tags;
    
    private BigDecimal rating;
    
    private Integer ratingCount;
    
    private Integer followCount;
    
    private Integer viewCount;
    
    private Integer verifyStatus;
    
    private LocalDateTime verifyTime;
    
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableField(exist = false)
    private String industryName;
    
    @TableField(exist = false)
    private String communityName;
}
