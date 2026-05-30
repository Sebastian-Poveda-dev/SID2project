package com.uniplan.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
@ConditionalOnProperty(name = "university.datasource.url")
public class InstitutionalDatabaseConfig {

    @Bean("institutionalDataSource")
    @ConfigurationProperties(prefix = "university.datasource")
    public DataSource institutionalDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean("institutionalJdbcTemplate")
    public JdbcTemplate institutionalJdbcTemplate(
            @Qualifier("institutionalDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
