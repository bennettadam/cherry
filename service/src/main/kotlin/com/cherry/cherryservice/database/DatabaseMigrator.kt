package com.cherry.cherryservice.database

import com.cherry.cherryservice.models.PropertyConfiguration
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.queryForObject

class DatabaseMigrator(val jdbcTemplate: JdbcTemplate, val args: Array<String>) {
    fun migrateDatabase() {
        val shouldDropDatabase = args.contains("--recreate-database")
        if (shouldDropDatabase) {
            jdbcTemplate.execute("DROP OWNED BY current_user;")
        }

        var schemaVersion = SchemaVersion.VERSION_ZERO
        val tableExists = jdbcTemplate.queryForObject<Boolean>("""
            SELECT EXISTS ( 
                SELECT FROM pg_tables
                WHERE schemaname = 'public'
                AND tablename = 'schema_version' 
            );
        """.trimIndent())

        if (tableExists) {
            val tableVersionRowSet = jdbcTemplate.queryForList("""
                SELECT version FROM schema_version ORDER BY creation_timestamp DESC LIMIT 1;
            """.trimIndent())

            val versionString = tableVersionRowSet.firstOrNull()?.get("version")?.toString()
            if (versionString != null) {
                schemaVersion = SchemaVersion.fromValue(versionString)
            }
        }

        val migrationEnabled = args.contains("--perform-migration")
        val migrationNeeded = schemaVersion != SchemaVersion.currentVersion
        if (migrationNeeded && !migrationEnabled) {
            throw IllegalStateException("Application database is currently on schema version ${schemaVersion.value}. Start the application with the --perform-migration flag to perform the database migration, or downgrade the application.")
        }

        while (schemaVersion != SchemaVersion.currentVersion) {
            println("Migrating $schemaVersion")
            when (schemaVersion) {
                SchemaVersion.VERSION_ZERO -> {
                    jdbcTemplate.execute("""
                        CREATE TABLE property_configurations (
                            id SERIAL PRIMARY KEY,
                            name TEXT NOT NULL,
                            property_type TEXT NOT NULL,
                            property_options TEXT[] NOT NULL,
                            default_value TEXT
                        );
                    """.trimIndent())

                    jdbcTemplate.update("INSERT INTO property_configurations (name, property_type, property_options, default_value) VALUES (?, ?, ?, ?);", "Description", PropertyConfiguration.Type.TEXT.value, emptyArray<String>(), null)

                    val criticalText = "Critical"
                    val priorityOptions = arrayOf(criticalText, "High", "Medium", "Low")
                    jdbcTemplate.update("INSERT INTO property_configurations (name, property_type, property_options, default_value) VALUES (?, ?, ?, ?);", "Priority", PropertyConfiguration.Type.ENUM.value, priorityOptions, criticalText)

                    val otherText = "Other"
                    val testTypeOptions = arrayOf(otherText, "Functional", "Smoke", "Exploratory")
                    jdbcTemplate.update("INSERT INTO property_configurations (name, property_type, property_options, default_value) VALUES (?, ?, ?, ?);", "Type", PropertyConfiguration.Type.ENUM.value, testTypeOptions, otherText)

                    // finish migration
                    jdbcTemplate.execute("CREATE TABLE schema_version (version TEXT NOT NULL, creation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);")
                    jdbcTemplate.update("INSERT INTO schema_version (version) VALUES (?);", "0.0.1")
                }
                SchemaVersion.VERSION_0_0_1 -> {
                    break;
                }
            }

            val tableVersionRowSet = jdbcTemplate.queryForList("""
                SELECT version FROM schema_version ORDER BY creation_timestamp DESC LIMIT 1;
            """.trimIndent())

            val versionString = tableVersionRowSet.firstOrNull()?.get("version")?.toString()
            require(versionString != null) { "Expecting version string" }
            schemaVersion = SchemaVersion.fromValue(versionString)
        }

        if (migrationNeeded) {
            println("Migration to version ${SchemaVersion.currentVersion.value} complete")
        }
    }
}