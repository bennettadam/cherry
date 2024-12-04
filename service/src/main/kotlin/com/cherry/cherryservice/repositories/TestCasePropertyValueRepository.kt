package com.cherry.cherryservice.repositories

import com.cherry.cherryservice.models.PropertyConfiguration
import com.cherry.cherryservice.models.TestCasePropertyValue
import org.springframework.data.jpa.repository.JpaRepository

interface TestCasePropertyValueRepository : JpaRepository<TestCasePropertyValue, Long> {
    fun deleteAllByPropertyConfiguration(propertyConfiguration: PropertyConfiguration)
}