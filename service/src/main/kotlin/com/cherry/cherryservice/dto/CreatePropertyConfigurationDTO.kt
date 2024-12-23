package com.cherry.cherryservice.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class CreatePropertyConfigurationDTO(
    val title: String,
    val propertyType: PropertyConfigurationType,
    @JsonProperty("isRequired")
    val isRequired: Boolean,
    val defaultValue: String?,
    val enumOptions: List<String>?
)