package com.cherry.cherryservice.dto

import java.util.UUID

data class UpdatePropertyConfigurationDTO(
    val propertyConfigurationID: UUID,
    val name: String,
    val isRequired: Boolean,
    val defaultValue: String?,
    val enumOptions: List<String>?
)