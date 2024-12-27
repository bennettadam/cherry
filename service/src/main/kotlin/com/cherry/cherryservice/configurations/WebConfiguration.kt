package com.cherry.cherryservice.configurations

import com.cherry.cherryservice.interceptors.RequestLoggingInterceptor
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfiguration(
    private val requestLoggingInterceptor: RequestLoggingInterceptor
) : WebMvcConfigurer {
    
    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(requestLoggingInterceptor)
            .addPathPatterns("/api/v1/workspace/**") // Only intercept workspace endpoints
    }
} 