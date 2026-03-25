package com.linmeng.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("orders")
public class Order implements Serializable {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String orderNo;
    
    private Long userId;
    
    private Long merchantId;
    
    private Long activityId;
    
    private Integer orderType;
    
    private String serviceName;
    
    private String serviceImage;
    
    private BigDecimal price;
    
    private Integer quantity;
    
    private BigDecimal totalAmount;
    
    private BigDecimal discountAmount;
    
    private BigDecimal payAmount;
    
    private String contactName;
    
    private String contactPhone;
    
    private String contactAddress;
    
    private LocalDateTime appointmentTime;
    
    private String remark;
    
    private Integer status;
    
    private String cancelReason;
    
    private LocalDateTime cancelTime;
    
    private LocalDateTime completeTime;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableField(exist = false)
    private String merchantName;
    
    @TableField(exist = false)
    private String userName;
    
    @TableField(exist = false)
    private String userAvatar;
}
