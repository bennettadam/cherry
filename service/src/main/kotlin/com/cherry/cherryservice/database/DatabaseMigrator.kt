package com.cherry.cherryservice.database

import com.cherry.cherryservice.dto.properties.PropertyConfigurationSource
import com.cherry.cherryservice.dto.properties.PropertyConfigurationType
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.queryForObject

class DatabaseMigrator(val jdbcTemplate: JdbcTemplate, val args: Array<String>) {

    private val log: Log = LogFactory.getLog(javaClass)

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
            log.info("Migrating $schemaVersion")
            when (schemaVersion) {
                SchemaVersion.VERSION_ZERO -> {
                    // projects
                    jdbcTemplate.execute("""
                        CREATE TABLE workspace_projects (
                            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                            external_id UUID DEFAULT gen_random_uuid(),
                            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            modify_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            title TEXT NOT NULL,
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
                            title TEXT NOT NULL,
                            property_type TEXT NOT NULL,
                            is_required BOOLEAN NOT NULL,
                            default_value TEXT,
                            select_options TEXT[]
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

                    // test runs
                    jdbcTemplate.execute("""
                        CREATE TABLE test_runs (
                            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                            external_id UUID DEFAULT gen_random_uuid(),
                            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            modify_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            project_id BIGINT REFERENCES workspace_projects(id),
                            test_run_number BIGINT NOT NULL,
                            status TEXT NOT NULL,
                            title TEXT NOT NULL,
                            description TEXT
                        )
                    """.trimIndent())

                    // test case runs
                    jdbcTemplate.execute("""
                        CREATE TABLE test_case_runs (
                            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                            external_id UUID DEFAULT gen_random_uuid(),
                            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            modify_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            test_run_id BIGINT REFERENCES test_runs(id),
                            test_case_id BIGINT REFERENCES test_cases(id),
                            status TEXT NOT NULL,
                            title TEXT NOT NULL,
                            description TEXT,
                            test_instructions TEXT
                        )
                    """.trimIndent())

                    val criticalText = "Critical"
                    jdbcTemplate.update("INSERT INTO property_configurations (source, title, property_type, is_required, default_value, select_options) VALUES (?, ?, ?, ?, ?, ?);",
                        PropertyConfigurationSource.SYSTEM.toString(),
                        "Priority",
                        PropertyConfigurationType.SINGLE_SELECT_LIST.toString(),
                        true,
                        criticalText,
                        arrayOf(criticalText, "High", "Medium", "Low"))

                    val otherText = "Other"
                    jdbcTemplate.update("INSERT INTO property_configurations (source, title, property_type, is_required, default_value, select_options) VALUES (?, ?, ?, ?, ?, ?);",
                        PropertyConfigurationSource.SYSTEM.toString(),
                        "Type",
                        PropertyConfigurationType.SINGLE_SELECT_LIST.toString(),
                        true,
                        otherText,
                        arrayOf(otherText, "Functional", "Smoke", "Exploratory"))

                    // finish migration
                    jdbcTemplate.execute("CREATE TABLE schema_version (version TEXT NOT NULL, creation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);")
                    jdbcTemplate.update("INSERT INTO schema_version (version) VALUES (?);", "0.0.1")
                }
                SchemaVersion.VERSION_0_0_1 -> {
                    jdbcTemplate.execute("""
                        ALTER TABLE test_case_runs
                        ADD COLUMN notes TEXT;
                    """.trimIndent())
                    
                    jdbcTemplate.update("INSERT INTO schema_version (version) VALUES (?);", "0.0.2")
                }
                SchemaVersion.VERSION_0_0_2 -> {
                    break
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
            log.info("Migration to version ${SchemaVersion.currentVersion.value} complete")
        }
    }
}