package com.cherry.cherryservice.dto

import java.util.Date
import java.util.UUID

data class PropertyConfigurationDTO(
    val propertyConfigurationID: UUID,
    val creationDate: Date,
    val source: PropertyConfigurationSource,
    val name: String,
    val propertyType: PropertyConfigurationType,
    val isRequired: Boolean,
    val defaultValue: String?,
    val enumOptions: List<String>?
)