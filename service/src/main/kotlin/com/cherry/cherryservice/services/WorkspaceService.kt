package com.cherry.cherryservice.services

import com.cherry.cherryservice.dto.*
import com.cherry.cherryservice.dto.projects.CreateWorkspaceProjectDTO
import com.cherry.cherryservice.dto.projects.WorkspaceProjectDTO
import com.cherry.cherryservice.dto.testcases.CreateTestCaseDTO
import com.cherry.cherryservice.dto.testcases.TestCaseDTO
import com.cherry.cherryservice.dto.testruns.*
import com.cherry.cherryservice.models.*
import com.cherry.cherryservice.repositories.*
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
    private val testRunRepository: TestRunRepository,
    private val testCaseRunRepository: TestCaseRunRepository,
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

    @Transactional
    fun updateTestCase(updateDTO: UpdateDTO<CreateTestCaseDTO>) {
        val testCase = testCaseRepository.findByExternalID(updateDTO.id)
        requireNotNull(testCase) { "No test case found" }
        testCase.title = updateDTO.data.title
        testCase.description = updateDTO.data.description
        testCase.testInstructions = updateDTO.data.testInstructions
        testCaseRepository.save(testCase)

        // wipe property values and recreate from update request
        testCasePropertyValueRepository.deleteAll(testCase.propertyValues)
        updateTestCasePropertyValues(testCase, updateDTO.data.propertyValues)
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

        updateTestCasePropertyValues(newTestCaseModel, testCase.propertyValues)
    }

    @Transactional
    fun updateTestCasePropertyValues(testCase: TestCase, updatedPropertyValue: Map<UUID, String>) {
        val propertyConfigurations = propertyConfigurationRepository.findAll()
        for (propertyConfigurationModel in propertyConfigurations) {
            val propertyValue: String

            val inputPropertyValue = updatedPropertyValue[propertyConfigurationModel.externalID]
            if (propertyConfigurationModel.isRequired) {
                requireNotNull(inputPropertyValue) { "Expecting input property" }
            }
            else if (inputPropertyValue == null) {
                // skip processing this if the property is not null
                continue
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
                    val enumOptions = propertyConfigurationModel.enumOptions ?: emptyList()
                    require(enumOptions.contains(inputPropertyValue)) { "Unrecognized enum option" }
                    propertyValue = inputPropertyValue
                }
            }

            val newPropertyModel = TestCasePropertyValue(
                testCase = testCase,
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

        if (property.isRequired) {
            requireNotNull(property.defaultValue) { "Missing default value" }
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

        // back-fill test cases if property value is non-null
        val defaultValue = (property.defaultValue)
        if (defaultValue != null) {
            val testCases = testCaseRepository.findAll()
            for (testCase in testCases) {
                val propertyValue = TestCasePropertyValue(
                    testCase = testCase,
                    propertyConfiguration = newModel,
                    value = defaultValue
                )
                testCasePropertyValueRepository.save(propertyValue)
            }
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

    fun retrieveTestRuns(projectID: UUID): List<TestRunDTO> {
        val project = projectRepository.findByExternalID(projectID)
        requireNotNull(project) { "No project found for id $projectID" }
        val testRuns = testRunRepository.findAllByProject(project)
        return testRuns.map { it.toDTO() }
    }

    @Transactional
    fun retrieveTestCaseRuns(testRunID: UUID): List<TestCaseRunDTO> {
        val testRun = testRunRepository.findByExternalID(testRunID)
        requireNotNull(testRun) { "No test run found for id $testRunID" }
        val testCaseRuns = testCaseRunRepository.findAllByTestRun(testRun)
        return testCaseRuns.map { it.toDTO() }
    }

    @Transactional
    fun createTestRun(projectID: UUID, testRun: CreateTestRunDTO) {
        val project = projectRepository.findByExternalID(projectID)
        requireNotNull(project) { "No project found for id $projectID" }

        val newTestRun = TestRun(
            project = project,
            status = TestRunStatus.PENDING,
            title = testRun.title,
            description = testRun.description
        )
        testRunRepository.save(newTestRun)

        for (testCaseID in testRun.testCaseIDs) {
            val testCaseModel = testCaseRepository.findByExternalID(testCaseID)
            requireNotNull(testCaseModel) { "No test case found for id $testCaseID" }
            val newTestCaseRun = TestCaseRun(
                testRun = newTestRun,
                testCase = testCaseModel,
                status = TestCaseRunStatus.PENDING,
                title = testCaseModel.title,
                description = testCaseModel.description,
                testInstructions = testCaseModel.testInstructions
            )
            testCaseRunRepository.save(newTestCaseRun)
        }
    }

    @Transactional
    fun updateTestCaseRun(testRunID: UUID, updateDTO: UpdateDTO<UpdateTestCaseRunDTO>) {
        val testCaseRun = testCaseRunRepository.findByExternalID(updateDTO.id)
        requireNotNull(testCaseRun) { "No test case found for id ${updateDTO.id}" }
        require(testCaseRun.testRun.externalID == testRunID) { "Test run id of test case does not match request test run id $testRunID" }
        testCaseRun.status = updateDTO.data.status
        testCaseRunRepository.save(testCaseRun)
    }
}