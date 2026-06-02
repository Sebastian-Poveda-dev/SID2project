package com.uniplan.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/uniplan}")
    private String jdbcUrl;

    @Value("${spring.datasource.username:uniplan}")
    private String username;

    @Value("${spring.datasource.password:uniplan}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(10);
        config.setConnectionTimeout(30_000);
        config.setPoolName("UniplanPool");
        return new HikariDataSource(config);
    }
}
