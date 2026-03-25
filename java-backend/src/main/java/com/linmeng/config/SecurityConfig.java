package com.linmeng.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/merchant/auth/**",
                    "/api/merchant/list",
                    "/api/merchant/page",
                    "/api/merchant/{id}",
                    "/api/activity/published",
                    "/api/activity/page",
                    "/api/activity/{id}",
                    "/api/industry/**",
                    "/api/community/**",
                    "/api/template/**",
                    "/api/doc.html",
                    "/api/swagger-resources/**",
                    "/api/v3/api-docs/**",
                    "/api/webjars/**"
                ).permitAll()
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
}
