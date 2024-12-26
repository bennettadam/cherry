package com.cherry.cherryservice.dto.properties

import com.fasterxml.jackson.annotation.JsonProperty
import java.util.Date
import java.util.UUID

data class PropertyConfigurationDTO(
    val propertyConfigurationID: UUID,
    val creationDate: Date,
    val source: PropertyConfigurationSource,
    val title: String,
    val propertyType: PropertyConfigurationType,
    @JsonProperty("isRequired")
    val isRequired: Boolean,
    val defaultValue: String?,
    val selectOptions: List<String>?
)