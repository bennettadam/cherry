package com.cherry.cherryservice.services

import com.cherry.cherryservice.dto.*
import com.cherry.cherryservice.dto.projects.CreateWorkspaceProjectDTO
import com.cherry.cherryservice.dto.projects.WorkspaceProjectDTO
import com.cherry.cherryservice.dto.testcases.CreateTestCaseDTO
import com.cherry.cherryservice.dto.testcases.TestCaseDTO
import com.cherry.cherryservice.dto.testcases.TestCasePropertyValueDTO
import com.cherry.cherryservice.models.PropertyConfiguration
import com.cherry.cherryservice.models.TestCase
import com.cherry.cherryservice.models.TestCasePropertyValue
import com.cherry.cherryservice.models.WorkspaceProject
import com.cherry.cherryservice.repositories.PropertyConfigurationRepository
import com.cherry.cherryservice.repositories.TestCasePropertyValueRepository
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
    private val testCasePropertyValueRepository: TestCasePropertyValueRepository,
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

    fun updateTestCase(updateDTO: UpdateDTO<CreateTestCaseDTO>) {
        val testCase = testCaseRepository.findByExternalID(updateDTO.id)
        requireNotNull(testCase) { "No test case found" }
        testCase.title = updateDTO.data.title
        testCase.description = updateDTO.data.description
        testCase.testInstructions = updateDTO.data.testInstructions
        testCaseRepository.save(testCase)
    }

    // todo: how to roll back transaction if we throw an error?
    @Transactional
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

        val testCasePropertyMap = emptyMap<UUID, TestCasePropertyValueDTO>().toMutableMap()
        val propertyValues = testCase.propertyValues ?: emptyList()
        for (property in propertyValues) {
            testCasePropertyMap[property.propertyConfigurationID] = property
        }

        val propertyConfigurations = propertyConfigurationRepository.findAll()
        for (propertyConfigurationModel in propertyConfigurations) {
            val propertyValue: String?

            val inputProperty = testCasePropertyMap[propertyConfigurationModel.externalID]
            val inputPropertyValue = inputProperty?.value
            if (propertyConfigurationModel.isRequired) {
                requireNotNull(inputPropertyValue) { "Expecting input property" }
            }

            when (propertyConfigurationModel.propertyType) {
                PropertyConfigurationType.TEXT -> {
                    propertyValue = inputPropertyValue
                }
                PropertyConfigurationType.NUMBER -> {
                    // todo: verify real number
                    propertyValue = inputPropertyValue
                }
                PropertyConfigurationType.ENUM -> {
                    if (inputPropertyValue == null) {
                        propertyValue = null
                    }
                    else {
                        val enumOptions = propertyConfigurationModel.enumOptions ?: emptyList()
                        require(enumOptions.contains(inputPropertyValue)) { "Unrecognized enum option" }
                        propertyValue = inputPropertyValue
                    }
                }
            }

            val newPropertyModel = TestCasePropertyValue(
                testCase = newTestCaseModel,
                propertyConfiguration = propertyConfigurationModel,
                value = propertyValue
            )
            testCasePropertyValueRepository.save(newPropertyModel)
        }
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
                    // intentionally don't allow direct changing of the property type in order to reduce complexity
                    // to change the type, the property should be deleted and recreated with the correct type
                    model.name = property.name
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

    @Transactional
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
            enumOptions = property.enumOptions
        )

        propertyConfigurationRepository.save(newModel)

        val testCases = testCaseRepository.findAll()
        for (testCase in testCases) {
            val propertyValue = TestCasePropertyValue(
                testCase = testCase,
                propertyConfiguration = newModel,
                value = newModel.defaultValue
            )
            testCasePropertyValueRepository.save(propertyValue)
        }
    }

    @Transactional
    fun deleteProperty(propertyConfigurationID: UUID) {
        val propertyModel = propertyConfigurationRepository.findByExternalID(propertyConfigurationID)
        requireNotNull(propertyModel) { "Unknown property model: $propertyConfigurationID" }

        // delete all references to this property configuration from test case values
        testCasePropertyValueRepository.deleteAllByPropertyConfiguration(propertyModel)

        // finally, delete the property configuration
        propertyConfigurationRepository.deleteByExternalID(propertyConfigurationID)
    }
}