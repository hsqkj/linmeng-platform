package com.linmeng;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@MapperScan("com.linmeng.mapper")
@EnableTransactionManagement
public class NeighborAllianceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NeighborAllianceApplication.class, args);
        System.out.println("========================================");
        System.out.println("邻盟营销助手启动成功！");
        System.out.println("API文档地址: http://localhost:8080/api/doc.html");
        System.out.println("========================================");
    }
}
