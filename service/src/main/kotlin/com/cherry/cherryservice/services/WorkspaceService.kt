package com.cherry.cherryservice.services

import com.cherry.cherryservice.dto.*
import com.cherry.cherryservice.models.PropertyConfiguration
import com.cherry.cherryservice.repositories.PropertyConfigurationRepository
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.stereotype.Service

@Service
class WorkspaceService(
    val propertyConfigurationRepository: PropertyConfigurationRepository,
) {
    private val log: Log = LogFactory.getLog(javaClass)

    fun retrieveProperties(): List<PropertyConfigurationDTO> {
        val properties = propertyConfigurationRepository.findAll()
        return properties.map { it.toDTO() }
    }

    fun updateProperty(property: UpdatePropertyConfigurationDTO) {
        try {
            val model = propertyConfigurationRepository.findByExternalID(property.propertyConfigurationID)
            requireNotNull(model) { "Unknown property model: ${property.propertyConfigurationID}" }

            when (model.source) {
                PropertyConfigurationSource.SYSTEM -> {
                    log.error("Unable to update system property")
                }
                PropertyConfigurationSource.CUSTOMER -> {
                    model.name = property.name
                    model.propertyType = property.propertyType
                    model.isRequired = property.isRequired
                    model.defaultValue = property.defaultValue
                    model.enumOptions = property.enumOptions
                }
            }

            propertyConfigurationRepository.save(model)
        }
        catch (e: Exception) {
            log.error("Encountered error while updating property model ${property.propertyConfigurationID}", e)
        }
    }

    fun createProperty(property: CreatePropertyConfigurationDTO) {
        if (property.propertyType == PropertyConfigurationType.ENUM) {
            requireNotNull(property.enumOptions) { "Missing enum configuration" }
        }

        val newModel = PropertyConfiguration(
            source = PropertyConfigurationSource.CUSTOMER,
            name = property.name,
            propertyType = property.propertyType,
            isRequired = property.isRequired,
            defaultValue = property.defaultValue,
            enumOptions = property.enumOptions)

        propertyConfigurationRepository.save(newModel)
    }
}