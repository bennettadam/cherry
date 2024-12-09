package com.cherry.cherryservice.models

import com.cherry.cherryservice.dto.testcases.TestCaseDTO
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.util.*

@Entity(name = "test_case_property_values")
class TestCasePropertyValue(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "external_id")
    val externalID: UUID = UUID.randomUUID(),

    @Column(name = "creation_date")
    @CreationTimestamp
    val creationDate: Date = Date(),

    @Column(name = "modify_date")
    @UpdateTimestamp
    val modifyDate: Date = Date(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id")
    val testCase: TestCase,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_configuration_id")
    val propertyConfiguration: PropertyConfiguration,

    @Column(name = "value")
    val value: String
)