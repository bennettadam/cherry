package com.cherry.cherryservice.models

import com.cherry.cherryservice.dto.properties.PropertyConfigurationDTO
import com.cherry.cherryservice.dto.properties.PropertyConfigurationSource
import com.cherry.cherryservice.dto.properties.PropertyConfigurationType
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.UpdateTimestamp
import org.hibernate.type.SqlTypes
import java.util.Date
import java.util.UUID

@Entity(name = "property_configurations")
class PropertyConfiguration(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "external_id", nullable = false)
    val externalID: UUID = UUID.randomUUID(),

    @Column(name = "creation_date")
    @CreationTimestamp
    val creationDate: Date = Date(),

    @Column(name = "modify_date")
    @UpdateTimestamp
    val modifyDate: Date = Date(),

    @Column(name = "source", nullable = false)
    @Enumerated(EnumType.STRING)
    val source: PropertyConfigurationSource,

    @Column(name = "title", nullable = false)
    var title: String,

    @Column(name = "property_type", nullable = false)
    @Enumerated(EnumType.STRING)
    var propertyType: PropertyConfigurationType,

    @Column(name = "is_required", nullable = false)
    var isRequired: Boolean,

    @Column(name = "default_value", nullable = true)
    var defaultValue: String?,

    @Column(name = "select_options", nullable = true)
    @JdbcTypeCode(SqlTypes.ARRAY)
    var selectOptions: List<String>?,
) {

    fun toDTO(): PropertyConfigurationDTO {
        return PropertyConfigurationDTO(externalID, creationDate, source, title, propertyType, isRequired, defaultValue, selectOptions)
    }
}