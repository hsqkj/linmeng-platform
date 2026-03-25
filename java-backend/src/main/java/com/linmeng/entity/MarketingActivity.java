package com.linmeng.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("marketing_activities")
public class MarketingActivity implements Serializable {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long merchantId;
    
    private Integer templateId;
    
    private String title;
    
    private String content;
    
    private String coverImage;
    
    private String images;
    
    private String videoUrl;
    
    private String tags;
    
    private String activityType;
    
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    private LocalDateTime publishTime;
    
    private LocalDateTime expireTime;
    
    private Integer status;
    
    private Integer viewCount;
    
    private Integer likeCount;
    
    private Integer shareCount;
    
    private Integer commentCount;
    
    private Integer collectionCount;
    
    private Integer orderCount;
    
    private BigDecimal orderAmount;
    
    private Integer isTop;
    
    private LocalDateTime topTime;
    
    private Integer isRecommend;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableField(exist = false)
    private String merchantName;
    
    @TableField(exist = false)
    private String merchantLogo;
    
    @TableField(exist = false)
    private BigDecimal merchantRating;
    
    @TableField(exist = false)
    private String merchantAddress;
}
