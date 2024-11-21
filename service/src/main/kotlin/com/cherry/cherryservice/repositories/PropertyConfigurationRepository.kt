package com.cherry.cherryservice.repositories

import com.cherry.cherryservice.models.PropertyConfiguration
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PropertyConfigurationRepository : JpaRepository<PropertyConfiguration, Long> {
    fun findByExternalID(externalID: UUID): PropertyConfiguration?
}