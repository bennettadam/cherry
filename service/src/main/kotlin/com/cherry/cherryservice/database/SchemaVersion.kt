package com.cherry.cherryservice.database

enum class SchemaVersion(val value: String) {
    VERSION_ZERO("0.0.0"),
    VERSION_0_0_1("0.0.1");

    companion object {
        fun fromValue(value: String): SchemaVersion {
            return entries.firstOrNull { it.value == value.lowercase() }
                ?: throw IllegalArgumentException("Unknown field type: $value")
        }

        val currentVersion: SchemaVersion = VERSION_0_0_1
    }
}