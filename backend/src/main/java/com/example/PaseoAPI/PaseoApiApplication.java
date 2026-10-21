package com.example.PaseoAPI;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PaseoApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(PaseoApiApplication.class, args);
	}

}
