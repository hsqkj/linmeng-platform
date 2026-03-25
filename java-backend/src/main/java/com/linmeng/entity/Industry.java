package com.linmeng.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("industries")
public class Industry implements Serializable {
    
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    private String name;
    
    private String icon;
    
    private String description;
    
    private Integer parentId;
    
    private Integer level;
    
    private Integer sortOrder;
    
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
