package com.linmeng.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.linmeng.entity.Community;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface CommunityMapper extends BaseMapper<Community> {
    
    @Select("SELECT * FROM communities WHERE status = 1 ORDER BY create_time DESC")
    List<Community> selectAllActive();
}
