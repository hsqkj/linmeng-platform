package com.linmeng.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Knife4jConfig {
    
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("邻盟营销助手API")
                        .description("邻盟营销助手后台接口文档")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("邻盟团队")
                                .email("contact@linmeng.com")));
    }
}
