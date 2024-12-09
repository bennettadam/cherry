package com.cherry.cherryservice.database

import com.cherry.cherryservice.dto.PropertyConfigurationSource
import com.cherry.cherryservice.dto.PropertyConfigurationType
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
                    // projects
                    jdbcTemplate.execute("""
                        CREATE TABLE workspace_projects (
                            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                            external_id UUID DEFAULT gen_random_uuid(),
                            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            modify_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            name TEXT NOT NULL,
                            project_short_code TEXT NOT NULL,
                            description TEXT
                        )
                    """.trimIndent())

                    // test cases
                    jdbcTemplate.execute("""
                        CREATE TABLE test_cases (
                            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                            external_id UUID DEFAULT gen_random_uuid(),
                            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            modify_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            project_id BIGINT REFERENCES workspace_projects(id),
                            test_case_number BIGINT NOT NULL,
                            title TEXT NOT NULL,
                            description TEXT,
                            test_instructions TEXT
                        )
                    """.trimIndent())

                    // property configurations
                    jdbcTemplate.execute("""
                        CREATE TABLE property_configurations (
                            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                            external_id UUID DEFAULT gen_random_uuid(),
                            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            modify_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            source TEXT NOT NULL,
                            name TEXT NOT NULL,
                            property_type TEXT NOT NULL,
                            is_required BOOLEAN NOT NULL,
                            default_value TEXT,
                            enum_options TEXT[]
                        );
                    """.trimIndent())

                    // test case property values
                    jdbcTemplate.execute("""
                        CREATE TABLE test_case_property_values (
                            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                            external_id UUID DEFAULT gen_random_uuid(),
                            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            modify_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            test_case_id BIGINT REFERENCES test_cases(id),
                            property_configuration_id BIGINT REFERENCES property_configurations(id),
                            value TEXT NOT NULL
                        )
                    """.trimIndent())

                    val criticalText = "Critical"
                    jdbcTemplate.update("INSERT INTO property_configurations (source, name, property_type, is_required, default_value, enum_options) VALUES (?, ?, ?, ?, ?, ?);",
                        PropertyConfigurationSource.SYSTEM.toString(),
                        "Priority",
                        PropertyConfigurationType.ENUM.toString(),
                        true,
                        criticalText,
                        arrayOf(criticalText, "High", "Medium", "Low"))

                    val otherText = "Other"
                    jdbcTemplate.update("INSERT INTO property_configurations (source, name, property_type, is_required, default_value, enum_options) VALUES (?, ?, ?, ?, ?, ?);",
                        PropertyConfigurationSource.SYSTEM.toString(),
                        "Type",
                        PropertyConfigurationType.ENUM.toString(),
                        true,
                        otherText,
                        arrayOf(otherText, "Functional", "Smoke", "Exploratory"))

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