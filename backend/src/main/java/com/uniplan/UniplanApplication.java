package com.uniplan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableJpaRepositories(basePackages = "com.uniplan.repository.jpa")
@EnableMongoRepositories(basePackages = "com.uniplan.repository.mongo")
public class UniplanApplication {

    public static void main(String[] args) {
        SpringApplication.run(UniplanApplication.class, args);
    }
}
