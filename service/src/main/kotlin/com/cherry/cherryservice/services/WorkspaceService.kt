package com.cherry.cherryservice.services

import com.cherry.cherryservice.dto.*
import com.cherry.cherryservice.dto.projects.CreateWorkspaceProjectDTO
import com.cherry.cherryservice.dto.projects.WorkspaceProjectDTO
import com.cherry.cherryservice.dto.testcases.CreateTestCaseDTO
import com.cherry.cherryservice.dto.testcases.TestCaseDTO
import com.cherry.cherryservice.models.PropertyConfiguration
import com.cherry.cherryservice.models.TestCase
import com.cherry.cherryservice.models.WorkspaceProject
import com.cherry.cherryservice.repositories.PropertyConfigurationRepository
import com.cherry.cherryservice.repositories.TestCaseRepository
import com.cherry.cherryservice.repositories.WorkspaceProjectRepository
import jakarta.transaction.Transactional
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.stereotype.Service
import java.util.*

@Service
class WorkspaceService(
    private val projectRepository: WorkspaceProjectRepository,
    private val testCaseRepository: TestCaseRepository,
    private val propertyConfigurationRepository: PropertyConfigurationRepository,
) {
    private val log: Log = LogFactory.getLog(javaClass)

    fun retrieveProjects(): List<WorkspaceProjectDTO> {
        val projects = projectRepository.findAll()
        return projects.map { it.toDTO() }
    }

    fun createProject(project: CreateWorkspaceProjectDTO) {
        val newProjectModel = WorkspaceProject(
            name = project.name,
            projectShortCode = project.projectShortCode,
            description = project.description)
        projectRepository.save(newProjectModel)
    }

    @Transactional
    fun retrieveTestCases(projectID: UUID): List<TestCaseDTO> {
        val project = projectRepository.findByExternalID(projectID)
        requireNotNull(project) { "No project found" }
        val testCases = testCaseRepository.findByProject(project)
        return testCases.map { it.toDTO() }
    }

    fun createTestCase(projectID: UUID, testCase: CreateTestCaseDTO) {
        val project = projectRepository.findByExternalID(projectID)
        requireNotNull(project) { "No project found" }

        val testCaseNumber = testCaseRepository.countByProject(project) + 1 // index test case numbers starting at 1
        val newTestCaseModel = TestCase(
            project = project,
            testCaseNumber = testCaseNumber,
            title = testCase.title,
            description = testCase.description,
            testInstructions = testCase.testInstructions,
        )
        testCaseRepository.save(newTestCaseModel)
    }

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