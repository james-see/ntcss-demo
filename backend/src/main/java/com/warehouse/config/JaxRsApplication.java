package com.warehouse.config;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

@ApplicationPath("/rest")
public class JaxRsApplication extends Application {
    // JAX-RS application entry point - registers all REST endpoints under /rest/*
}