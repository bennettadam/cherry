package com.cherry.cherryservice.dto

import com.fasterxml.jackson.annotation.JsonProperty
import java.util.UUID

data class UpdatePropertyConfigurationDTO(
    val propertyConfigurationID: UUID,
    val name: String,
    @JsonProperty("isRequired")
    val isRequired: Boolean,
    val defaultValue: String?,
    val enumOptions: List<String>?
)