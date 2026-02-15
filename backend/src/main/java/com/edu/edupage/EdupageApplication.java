package com.edu.edupage;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.edu.edupage.repository")
@OpenAPIDefinition(info = @Info(title = "EduPage API", version = "1.0", description = "EduPage School Management API"))
public class EdupageApplication {
    public static void main(String[] args) {
        SpringApplication.run(EdupageApplication.class, args);
    }
}
