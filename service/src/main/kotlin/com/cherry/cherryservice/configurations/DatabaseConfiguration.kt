package com.cherry.cherryservice.configurations

import com.cherry.cherryservice.database.DatabaseMigrator
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.queryForObject

@Configuration
class DatabaseConfiguration {
    @Bean
    fun migrateDatabase(jdbcTemplate: JdbcTemplate) = CommandLineRunner { args ->
        val migrator = DatabaseMigrator(jdbcTemplate, args)
        migrator.migrateDatabase()
    }
}