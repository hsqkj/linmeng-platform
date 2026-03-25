package com.linmeng.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linmeng.entity.Industry;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface IndustryMapper extends BaseMapper<Industry> {
    
    @Select("SELECT * FROM industries WHERE status = 1 ORDER BY sort_order ASC")
    List<Industry> selectAllActive();
}
