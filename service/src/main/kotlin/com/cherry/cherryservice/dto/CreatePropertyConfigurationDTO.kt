package com.cherry.cherryservice.dto

data class CreatePropertyConfigurationDTO(
    val name: String,
    val propertyType: PropertyConfigurationType,
    val isRequired: Boolean,
    val defaultValue: String?,
    val enumOptions: List<String>?
)