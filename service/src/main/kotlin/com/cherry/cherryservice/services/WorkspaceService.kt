package com.cherry.cherryservice.services

import com.cherry.cherryservice.dto.*
import com.cherry.cherryservice.dto.projects.CreateWorkspaceProjectDTO
import com.cherry.cherryservice.dto.projects.WorkspaceProjectDTO
import com.cherry.cherryservice.dto.properties.*
import com.cherry.cherryservice.dto.testcases.CreateTestCaseDTO
import com.cherry.cherryservice.dto.testcases.TestCaseDTO
import com.cherry.cherryservice.dto.testruns.*
import com.cherry.cherryservice.models.*
import com.cherry.cherryservice.repositories.*
import com.cherry.cherryservice.utility.Tools
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
        require(project.title.isNotBlank()) { "Project must have a title" }
        require(project.projectShortCode.isNotBlank()) { "Project must have a short code" }

        require(project.projectShortCode.matches(Regex("^[A-Z0-9]+$"))) { "Project short code must only contain uppercase letters and numbers" }

        var existingProject = projectRepository.findByTitle(project.title)
        require(existingProject == null) { "Project with title ${project.title} already exists" }

        existingProject = projectRepository.findByProjectShortCode(project.projectShortCode)
        require(existingProject == null) { "Project with short code ${project.projectShortCode} already exists" }

        var description: String? = null
        if (!project.description.isNullOrBlank()) {
            description = project.description
        }

        val newProjectModel = WorkspaceProject(
            title = project.title,
            projectShortCode = project.projectShortCode,
            description = description)
        projectRepository.save(newProjectModel)
    }

    @Transactional
    fun retrieveTestCases(projectShortCode: String): List<TestCaseDTO> {
        val project = projectRepository.findByProjectShortCode(projectShortCode)
        requireNotNull(project) { "No project found" }
        val testCases = testCaseRepository.findByProjectOrderByTestCaseNumberAsc(project)
        return testCases.map { it.toDTO() }
    }

    @Transactional
    fun updateTestCase(testCaseID: UUID, updateDTO: CreateTestCaseDTO) {
        val testCase = testCaseRepository.findByExternalID(testCaseID)
        requireNotNull(testCase) { "No test case found with id $testCaseID" }

        require(updateDTO.title.isNotBlank()) { "Test case must have a title" }

        testCase.title = updateDTO.title
        testCase.description = Tools.sanitize(updateDTO.description)
        testCase.testInstructions = Tools.sanitize(updateDTO.testInstructions)
        testCaseRepository.save(testCase)

        // wipe property values and recreate from update request
        testCasePropertyValueRepository.deleteAll(testCase.propertyValues)
        updateTestCasePropertyValues(testCase, updateDTO.propertyValues)
    }

    @Transactional
    fun createTestCase(projectShortCode: String, testCase: CreateTestCaseDTO) {
        val project = projectRepository.findByProjectShortCode(projectShortCode)
        requireNotNull(project) { "No project found" }

        require(testCase.title.isNotBlank()) { "Test case must have a title" }

        // find the test case with the largest test case number and bump it up by 1
        val largestTestCaseNumber = testCaseRepository.findTopByProjectOrderByTestCaseNumberDesc(project)?.testCaseNumber ?: 0
        val newTestCaseModel = TestCase(
            project = project,
            testCaseNumber = largestTestCaseNumber + 1,
            title = testCase.title,
            description = Tools.sanitize(testCase.description),
            testInstructions = Tools.sanitize(testCase.testInstructions),
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
                requireNotNull(inputPropertyValue) { "Expecting value for ${propertyConfigurationModel.title} property" }
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
                PropertyConfigurationType.SINGLE_SELECT_LIST -> {
                    val selectOptions = propertyConfigurationModel.selectOptions ?: emptyList()
                    require(selectOptions.contains(inputPropertyValue)) { "Unrecognized select option '$inputPropertyValue' for ${propertyConfigurationModel.title} property" }
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

    @Transactional
    fun deleteTestCase(testCaseID: UUID) {
        val testCase = testCaseRepository.findByExternalID(testCaseID)
        requireNotNull(testCase) { "No test case found with id $testCaseID" }

        // delete all references to this test case from test case property values
        testCasePropertyValueRepository.deleteAllByTestCase(testCase)

        testCaseRepository.delete(testCase)
    }

    fun retrieveProperties(): List<PropertyConfigurationDTO> {
        val properties = propertyConfigurationRepository.findAll()
        return properties.map { it.toDTO() }
    }

    fun updateProperty(property: UpdatePropertyConfigurationDTO) {
        val model = propertyConfigurationRepository.findByExternalID(property.propertyConfigurationID)
        requireNotNull(model) { "Unknown property model: ${property.propertyConfigurationID}" }

        when (model.source) {
            PropertyConfigurationSource.SYSTEM -> {
                log.error("Unable to update system property")
            }
            PropertyConfigurationSource.CUSTOMER -> {
                if (property.isRequired) {
                    require(!property.defaultValue.isNullOrBlank()) { "Required properties must have a default value" }
                }

                if (model.propertyType == PropertyConfigurationType.SINGLE_SELECT_LIST) {
                    requireNotNull(property.selectOptions) { "Missing select options configuration" }

                    if (property.defaultValue != null) {
                        require(property.selectOptions.contains(property.defaultValue)) { "Default value must be a valid option" }
                    }
                }

                // intentionally don't allow direct changing of the property type in order to reduce complexity
                // to change the type, the property should be deleted and recreated with the correct type
                model.title = property.title
                model.isRequired = property.isRequired
                model.defaultValue = property.defaultValue
                model.selectOptions = property.selectOptions
            }
        }

        propertyConfigurationRepository.save(model)
    }

    @Transactional
    fun createProperty(property: CreatePropertyConfigurationDTO) {
        if (property.propertyType == PropertyConfigurationType.SINGLE_SELECT_LIST) {
            requireNotNull(property.selectOptions) { "Missing select options configuration" }
        }

        if (property.isRequired) {
            requireNotNull(property.defaultValue) { "Missing default value" }
        }

        val newModel = PropertyConfiguration(
            source = PropertyConfigurationSource.CUSTOMER,
            title = property.title,
            propertyType = property.propertyType,
            isRequired = property.isRequired,
            defaultValue = property.defaultValue,
            selectOptions = property.selectOptions
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
        propertyConfigurationRepository.delete(propertyModel)
    }

    fun retrieveTestRuns(projectShortCode: String): List<TestRunDTO> {
        val project = projectRepository.findByProjectShortCode(projectShortCode)
        requireNotNull(project) { "No project found for id $projectShortCode" }
        val testRuns = testRunRepository.findAllByProject(project)
        return testRuns.map { it.toDTO() }
    }

    @Transactional
    fun retrieveTestCaseRuns(projectShortCode: String, testRunNumber: Long): List<TestCaseRunDTO> {
        val project = projectRepository.findByProjectShortCode(projectShortCode)
        requireNotNull(project) { "No project found for id $projectShortCode" }

        val testRun = testRunRepository.findByProjectAndTestRunNumber(project, testRunNumber)
        requireNotNull(testRun) { "No test run found with test run number $testRunNumber" }
        val testCaseRuns = testCaseRunRepository.findAllByTestRun(testRun)
        return testCaseRuns.map { it.toDTO() }
    }

    @Transactional
    fun createTestRun(projectShortCode: String, testRun: CreateTestRunDTO) {
        val project = projectRepository.findByProjectShortCode(projectShortCode)
        requireNotNull(project) { "No project found for id $projectShortCode" }

        require(testRun.testCaseIDs.isNotEmpty()) { "There must be at least one test case for the test run" }

        // find the test run with the largest test run number and bump it up by 1
        val largestTestRunNumber = testRunRepository.findTopByProjectOrderByTestRunNumberDesc(project)?.testRunNumber ?: 0
        val newTestRun = TestRun(
            project = project,
            testRunNumber = largestTestRunNumber + 1,
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
    fun updateTestRun(testRunID: UUID, updateDTO: UpdateTestRunDTO) {
        val testRun = testRunRepository.findByExternalID(testRunID)
        requireNotNull(testRun) { "No test run found for id $testRunID" }

        testRun.title = updateDTO.title
        testRun.description = updateDTO.description
        testRun.status = updateDTO.status

        testRunRepository.save(testRun)
    }

    @Transactional
    fun deleteTestRun(testRunID: UUID) {
        val testRun = testRunRepository.findByExternalID(testRunID)
        requireNotNull(testRun) { "No test run found for id $testRunID" }

        // First delete all associated test case runs
        testCaseRunRepository.deleteAllByTestRun(testRun)
        
        // Then delete the test run itself
        testRunRepository.delete(testRun)
    }

    @Transactional
    fun updateTestCaseRun(testCaseRunID: UUID, updateDTO: UpdateTestCaseRunDTO) {
        val testCaseRun = testCaseRunRepository.findByExternalID(testCaseRunID)
        requireNotNull(testCaseRun) { "No test case found for id $testCaseRunID" }

        testCaseRun.status = updateDTO.status
        testCaseRunRepository.save(testCaseRun)

        val testRun = testCaseRun.testRun
        val testCaseRuns = testCaseRunRepository.findAllByTestRun(testRun)

        val isTestRunComplete = testCaseRuns.all { it.status != TestCaseRunStatus.PENDING }
        if (isTestRunComplete) {
            testRun.status = TestRunStatus.COMPLETE
            testRunRepository.save(testRun)
        }
        else if (testRun.status == TestRunStatus.PENDING) {
            testRun.status = TestRunStatus.IN_PROGRESS
            testRunRepository.save(testRun)
        }
    }

    @Transactional
    fun deleteTestCaseRun(testCaseRunID: UUID) {
        testCaseRunRepository.deleteByExternalID(testCaseRunID)
    }
}