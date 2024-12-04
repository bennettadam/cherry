package com.cherry.cherryservice.models

import com.cherry.cherryservice.dto.projects.WorkspaceProjectDTO
import com.cherry.cherryservice.dto.testcases.TestCaseDTO
import com.cherry.cherryservice.dto.testcases.TestCasePropertyValueDTO
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.util.*

@Entity(name = "test_cases")
class TestCase(
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
    @JoinColumn(name = "project_id")
    val project: WorkspaceProject,

    @Column(name = "test_case_number")
    val testCaseNumber: Long,

    @Column(name = "title")
    var title: String,

    @Column(name = "description")
    var description: String?,

    @Column(name = "test_instructions")
    var testInstructions: String?,

    @OneToMany(mappedBy = "testCase")
    val propertyValues: List<TestCasePropertyValue> = emptyList(),
) {

    fun toDTO(): TestCaseDTO {
        val propertyValueDTOs = propertyValues.map { it.toDTO() }
        return TestCaseDTO(externalID, creationDate, project.externalID, testCaseNumber, title, description, testInstructions, propertyValueDTOs)
    }
}