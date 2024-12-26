package com.cherry.cherryservice.dto.properties

import com.fasterxml.jackson.annotation.JsonProperty
import java.util.UUID

data class UpdatePropertyConfigurationDTO(
    val propertyConfigurationID: UUID,
    val title: String,
    @JsonProperty("isRequired")
    val isRequired: Boolean,
    val defaultValue: String?,
    val selectOptions: List<String>?
)