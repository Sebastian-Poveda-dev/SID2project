package com.uniplan.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
@ConditionalOnProperty(name = "university.datasource.url")
public class InstitutionalDatabaseConfig {

    @Value("${university.datasource.url}")
    private String url;

    @Value("${university.datasource.username}")
    private String username;

    @Value("${university.datasource.password:}")
    private String password;

    @Bean("institutionalDataSource")
    public DataSource institutionalDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setPoolName("UniversityPool");
        config.setMaximumPoolSize(5);
        return new HikariDataSource(config);
    }

    @Bean("institutionalJdbcTemplate")
    public JdbcTemplate institutionalJdbcTemplate(
            @Qualifier("institutionalDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
