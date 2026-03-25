package com.linmeng.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("communities")
public class Community implements Serializable {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    private String name;
    
    private String city;
    
    private String district;
    
    private String street;
    
    private String address;
    
    private BigDecimal latitude;
    
    private BigDecimal longitude;
    
    private Integer population;
    
    private Integer householdCount;
    
    private BigDecimal area;
    
    private String contactPerson;
    
    private String contactPhone;
    
    private String description;
    
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
