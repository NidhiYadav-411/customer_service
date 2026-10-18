package com.spos.customerservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CustomerServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CustomerServiceApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" Customer Service Center - Round Robin Scheduler");
        System.out.println(" Local Application started successfully!");
        System.out.println(" Open your browser at: http://localhost:8080");
        System.out.println("=================================================");
    }
}
