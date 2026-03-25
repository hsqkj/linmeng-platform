package com.linmeng.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("marketing_templates")
public class MarketingTemplate implements Serializable {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    private String code;
    
    private String name;
    
    private String category;
    
    private String type;
    
    private String icon;
    
    private String coverImage;
    
    private String titleTemplate;
    
    private String contentTemplate;
    
    private String fields;
    
    private String aiDirection;
    
    private String applicableIndustries;
    
    private Integer sortOrder;
    
    private Integer useCount;
    
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
