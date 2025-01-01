package com.cherry.cherryservice.database

enum class DatabaseMigrationMode {
    NONE,
    MIGRATE,
    REBUILD;

    companion object {
        val ENVIRONMENT_KEY = "DATABASE_MIGRATION_MODE"
    }
}