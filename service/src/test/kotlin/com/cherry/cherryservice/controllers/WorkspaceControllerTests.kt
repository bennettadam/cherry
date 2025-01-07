package com.cherry.cherryservice.controllers

import com.cherry.cherryservice.database.DatabaseMigrator
import com.cherry.cherryservice.dto.projects.CreateWorkspaceProjectDTO
import com.cherry.cherryservice.dto.properties.CreatePropertyConfigurationDTO
import com.cherry.cherryservice.dto.properties.PropertyConfigurationDTO
import com.cherry.cherryservice.dto.properties.PropertyConfigurationType
import com.cherry.cherryservice.dto.properties.UpdatePropertyConfigurationDTO
import com.cherry.cherryservice.dto.testcases.CreateTestCaseDTO
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.web.servlet.MockMvc
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import com.cherry.cherryservice.dto.testcases.TestCaseDTO
import com.cherry.cherryservice.dto.testruns.*
import org.hamcrest.Matchers
import java.util.UUID
import kotlin.test.assertEquals

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class WorkspaceControllerTests {
    
    companion object {
        @Container
        private val postgresContainer = PostgreSQLContainer<Nothing>("postgres:latest").apply {
            withDatabaseName("testdb")
            withUsername("test")
            withPassword("test")
        }

        @JvmStatic
        @DynamicPropertySource
        fun properties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", postgresContainer::getJdbcUrl)
            registry.add("spring.datasource.username", postgresContainer::getUsername)
            registry.add("spring.datasource.password", postgresContainer::getPassword)
        }
    }

    @Autowired
    private lateinit var databaseMigrator: DatabaseMigrator

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @BeforeEach
    fun beforeEach() {
        databaseMigrator.run()
    }

    @Test
    fun `should create projects successfully`() {
        val project1 = CreateWorkspaceProjectDTO(
            title = "Test Project",
            projectShortCode = "TEST",
            description = "Test Description"
        )

        val project2 = CreateWorkspaceProjectDTO(
            title = "Second Test Project",
            projectShortCode = "TEST2",
            description = "Second Test Description"
        )

        mockMvc.perform(post("/api/v1/workspace/projects")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(project1)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        mockMvc.perform(post("/api/v1/workspace/projects")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(project2)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        mockMvc.perform(get("/api/v1/workspace/projects")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
            .andExpect(jsonPath("$.data.size()").value(2))
            // project 1
            .andExpect(jsonPath("$.data[0].title").value("Test Project"))
            .andExpect(jsonPath("$.data[0].projectShortCode").value("TEST"))
            .andExpect(jsonPath("$.data[0].description").value("Test Description"))
            // project 2
            .andExpect(jsonPath("$.data[1].title").value("Second Test Project"))
            .andExpect(jsonPath("$.data[1].projectShortCode").value("TEST2"))
            .andExpect(jsonPath("$.data[1].description").value("Second Test Description"))
    }

    @Test
    fun `should create test cases when project exists`() {
        val project = createProject()
        val properties = getProperties()
        val testCase = createTestCase(projectShortCode = project.projectShortCode, properties = properties)

        mockMvc.perform(get("/api/v1/workspace/test-cases/${project.projectShortCode}")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
            .andExpect(jsonPath("$.data.size()").value(1))
            .andExpect(jsonPath("$.data[0].title").value(testCase.title))
            .andExpect(jsonPath("$.data[0].description").value(testCase.description))
            .andExpect(jsonPath("$.data[0].testInstructions").value(testCase.testInstructions))
    }

    @Test
    fun `should not create test cases when project does not exist`() {
        val properties = getProperties()
        val propertyValues = emptyMap<UUID, String>().toMutableMap()
        for (property in properties) {
            if (property.isRequired) {
                // all required properties should have a default value
                propertyValues[property.propertyConfigurationID] = property.defaultValue!!
            }
        }

        val testCase = CreateTestCaseDTO(
            title = "Sample Test Case",
            description = "Test case description",
            testInstructions = "1. Do this\n2. Do that",
            propertyValues = propertyValues
        )

        mockMvc.perform(post("/api/v1/workspace/test-cases/NONEXISTENT")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(testCase)))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `given project A with test cases when fetching test cases for project B then returns empty list`() {
        val projectA = createProject(title = "Project A", projectShortCode = "PRA")
        val projectB = createProject(title = "Project B", projectShortCode = "PRB")

        val properties = getProperties()
        createTestCase(projectShortCode = projectA.projectShortCode, title = "Project A Test Case", properties = properties)

        // verify project B has no test cases
        mockMvc.perform(get("/api/v1/workspace/test-cases/${projectB.projectShortCode}")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
            .andExpect(jsonPath("$.data.size()").value(0))
    }

    

    @Test
    fun `should update test case when test case exists`() {
        val project = createProject()
        val properties = getProperties()
        val createTestCaseDTO = createTestCase(projectShortCode = project.projectShortCode, title = "Initial Test Case", properties = properties)
        val resultTestCase = getTestCases(project.projectShortCode).first()

        val updatedTestCase = CreateTestCaseDTO(
            title = "Updated Test Case",
            description = "Updated description",
            testInstructions = "Updated instructions",
            propertyValues = createTestCaseDTO.propertyValues
        )

        mockMvc.perform(put("/api/v1/workspace/test-cases/${resultTestCase.testCaseID}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updatedTestCase)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        // verify the update
        mockMvc.perform(get("/api/v1/workspace/test-cases/${project.projectShortCode}")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[0].title").value(updatedTestCase.title))
            .andExpect(jsonPath("$.data[0].description").value(updatedTestCase.description))
            .andExpect(jsonPath("$.data[0].testInstructions").value(updatedTestCase.testInstructions))
    }

    @Test
    fun `should create text property successfully`() {
        val property = CreatePropertyConfigurationDTO(
            title = "Test Property",
            propertyType = PropertyConfigurationType.TEXT,
            isRequired = true,
            defaultValue = "Default Value",
            selectOptions = null
        )

        mockMvc.perform(post("/api/v1/workspace/properties")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(property)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        // verify the new property was created
        val properties = getProperties()
        assertEquals(3, properties.size)

        val resultProperty = properties.first { it.title == property.title }
        assertEquals(property.title, resultProperty.title)
        assertEquals(property.propertyType, resultProperty.propertyType)
        assertEquals(property.isRequired, resultProperty.isRequired)
        assertEquals(property.defaultValue, resultProperty.defaultValue)
    }

    @Test
    fun `should create number property successfully`() {
        val property = CreatePropertyConfigurationDTO(
            title = "Number Property",
            propertyType = PropertyConfigurationType.NUMBER,
            isRequired = true,
            defaultValue = "5",
            selectOptions = null
        )

        mockMvc.perform(post("/api/v1/workspace/properties")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(property)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        // verify the new property was created
        val properties = getProperties()
        assertEquals(3, properties.size)

        val resultProperty = properties.first { it.title == property.title }
        assertEquals(property.title, resultProperty.title)
        assertEquals(property.propertyType, resultProperty.propertyType)
        assertEquals(property.isRequired, resultProperty.isRequired)
        assertEquals(property.defaultValue, resultProperty.defaultValue)
    }

    @Test
    fun `should create select list property successfully`() {
        val selectOptions = listOf("Option 1", "Option 2", "Option 3")
        val property = CreatePropertyConfigurationDTO(
            title = "Test Select List",
            propertyType = PropertyConfigurationType.SINGLE_SELECT_LIST,
            isRequired = true,
            defaultValue = "Option 1",
            selectOptions = selectOptions
        )

        mockMvc.perform(post("/api/v1/workspace/properties")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(property)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        // verify property was created with select options
        val properties = getProperties()
        assertEquals(3, properties.size)

        val resultProperty = properties.first { it.title == property.title }
        assertEquals(selectOptions, resultProperty.selectOptions)
    }

    @Test
    fun `should update property successfully`() {
        // first create a property
        val property = CreatePropertyConfigurationDTO(
            title = "Original Title",
            propertyType = PropertyConfigurationType.TEXT,
            isRequired = false,
            defaultValue = null,
            selectOptions = null
        )

        mockMvc.perform(post("/api/v1/workspace/properties")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(property)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        val newProperty = getProperties().first { it.title == property.title }

        // update the property
        val updateDTO = UpdatePropertyConfigurationDTO(
            propertyConfigurationID = newProperty.propertyConfigurationID,
            title = "Updated Title",
            isRequired = true,
            defaultValue = "New Default",
            selectOptions = null
        )

        mockMvc.perform(put("/api/v1/workspace/properties")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updateDTO)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        // verify the update
        val properties = getProperties()
        assertEquals(3, properties.size)

        val resultProperty = properties.first { it.title == updateDTO.title }
        assertEquals(updateDTO.title, resultProperty.title)
        assertEquals(updateDTO.isRequired, resultProperty.isRequired)
        assertEquals(updateDTO.defaultValue, resultProperty.defaultValue)
    }

    @Test
    fun `should fail to create select list property without options`() {
        val property = CreatePropertyConfigurationDTO(
            title = "Invalid Select List",
            propertyType = PropertyConfigurationType.SINGLE_SELECT_LIST,
            isRequired = true,
            defaultValue = "Option 1",
            selectOptions = null  // This should cause validation to fail
        )

        mockMvc.perform(post("/api/v1/workspace/properties")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(property)))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should fail to create required property without default value`() {
        val property = CreatePropertyConfigurationDTO(
            title = "Invalid Required Property",
            propertyType = PropertyConfigurationType.TEXT,
            isRequired = true,
            defaultValue = null,  // This should cause validation to fail
            selectOptions = null
        )

        mockMvc.perform(post("/api/v1/workspace/properties")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(property)))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should create test case with new required property successfully`() {
        // create property values map of existing properties
        val properties = getProperties()
        val propertyValues = mutableMapOf<UUID, String>()
        for (property in properties) {
            if (property.isRequired) {
                propertyValues[property.propertyConfigurationID] = property.defaultValue!!
            }
        }

        // create project and initial required property
        val project = createProject()

        val newProperty = CreatePropertyConfigurationDTO(
            title = "Required Field",
            propertyType = PropertyConfigurationType.TEXT,
            isRequired = true,
            defaultValue = "Default Value",
            selectOptions = null
        )

        mockMvc.perform(post("/api/v1/workspace/properties")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newProperty)))
            .andExpect(status().isOk)

        val updatedProperties = getProperties()
        val requiredProperty = updatedProperties.first { it.title == newProperty.title }

        // add in a value for the new property
        propertyValues[requiredProperty.propertyConfigurationID] = "Test Value"

        val testCase = CreateTestCaseDTO(
            title = "Test Case With Required Property",
            description = "Test Description",
            testInstructions = "Test Instructions",
            propertyValues = propertyValues
        )

        // create test case with new property
        mockMvc.perform(post("/api/v1/workspace/test-cases/${project.projectShortCode}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(testCase)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        val resultTestCase = getTestCases(project.projectShortCode).first()
        assertEquals(propertyValues, resultTestCase.propertyValues)
    }

    @Test
    fun `should fail to create test case when missing required property`() {
        val properties = getProperties()
        val propertyValues = mutableMapOf<UUID, String>()
        for (property in properties) {
            if (property.isRequired) {
                propertyValues[property.propertyConfigurationID] = property.defaultValue!!
            }
        }

        // Create project and initial required property
        val project = createProject()
        
        // Create a new required property
        val newProperty = CreatePropertyConfigurationDTO(
            title = "New Required Field",
            propertyType = PropertyConfigurationType.TEXT,
            isRequired = true,
            defaultValue = "Default Value",
            selectOptions = null
        )

        mockMvc.perform(post("/api/v1/workspace/properties")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newProperty)))
            .andExpect(status().isOk)

        // Create test case without the required property value
        val testCase = CreateTestCaseDTO(
            title = "Test Case Missing Required Property",
            description = "Test Description",
            testInstructions = "Test Instructions",
            propertyValues = propertyValues // Intentionally missing new property to trigger error
        )

        // Attempt to create test case without required property
        mockMvc.perform(post("/api/v1/workspace/test-cases/${project.projectShortCode}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(testCase)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value(Matchers.containsString(newProperty.title)))
    }

    @Test
    fun `should create test run successfully`() {
        // Create a project and test cases first
        val project = createProject()
        val properties = getProperties()
        createTestCase(projectShortCode = project.projectShortCode, title = "Test Case 1", properties = properties)
        createTestCase(projectShortCode = project.projectShortCode, title = "Test Case 2", properties = properties)

        // Get the created test cases
        val testCases = getTestCases(project.projectShortCode)
        val testCaseIDs = testCases.map { it.testCaseID }

        val createTestRunDTO = CreateTestRunDTO(
            title = "Test Run 1",
            description = "Test Run Description",
            testCaseIDs = testCaseIDs
        )

        mockMvc.perform(post("/api/v1/workspace/test-runs/${project.projectShortCode}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createTestRunDTO)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        // Verify test run was created
        val testRuns = getTestRuns(project.projectShortCode)
        assertEquals(1, testRuns.size)

        val resultTestRun = testRuns.first()
        assertEquals(createTestRunDTO.title, resultTestRun.title)
        assertEquals(createTestRunDTO.description, resultTestRun.description)
        assertEquals(TestRunStatus.PENDING, resultTestRun.status) // test runs start in pending status
        assertEquals(1, resultTestRun.testRunNumber)
    }

    @Test
    fun `should fail to create test run with empty test cases`() {
        val project = createProject()
        
        val createTestRunDTO = CreateTestRunDTO(
            title = "Invalid Test Run",
            description = "Should fail",
            testCaseIDs = emptyList()
        )

        mockMvc.perform(post("/api/v1/workspace/test-runs/${project.projectShortCode}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createTestRunDTO)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("There must be at least one test case for the test run"))
    }

    @Test
    fun `should update test run successfully`() {
        // Create initial test run
        val project = createProject()
        val properties = getProperties()
        createTestCase(projectShortCode = project.projectShortCode, properties = properties)
        val testCases = getTestCases(project.projectShortCode)

        val createTestRunDTO = CreateTestRunDTO(
            title = "Initial Title",
            description = "Initial Description",
            testCaseIDs = listOf(testCases.first().testCaseID)
        )

        mockMvc.perform(post("/api/v1/workspace/test-runs/${project.projectShortCode}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createTestRunDTO)))
            .andExpect(status().isOk)

        // Get the created test run
        var resultTestRun = getTestRuns(project.projectShortCode).first()

        // Update the test run
        val updateTestRunDTO = UpdateTestRunDTO(
            title = "Updated Title",
            description = "Updated Description",
            status = TestRunStatus.ABORT
        )

        mockMvc.perform(put("/api/v1/workspace/test-runs/${resultTestRun.testRunID}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updateTestRunDTO)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        // Verify the update
        resultTestRun = getTestRuns(project.projectShortCode).first()
        assertEquals(updateTestRunDTO.title, resultTestRun.title)
        assertEquals(updateTestRunDTO.description, resultTestRun.description)
        assertEquals(updateTestRunDTO.status, resultTestRun.status)
        assertEquals(1, resultTestRun.testRunNumber)
    }

    @Test
    fun `should update test case run status and notes`() {
        // Create project and test cases
        val project = createProject()
        val properties = getProperties()
        createTestCase(projectShortCode = project.projectShortCode, title = "Test Case 1", properties = properties)
        createTestCase(projectShortCode = project.projectShortCode, title = "Test Case 2", properties = properties)

        // Create test run
        val testCases = getTestCases(project.projectShortCode)
        val createTestRunDTO = CreateTestRunDTO(
            title = "Test Run 1",
            description = "Test Run Description",
            testCaseIDs = testCases.map { it.testCaseID }
        )

        mockMvc.perform(post("/api/v1/workspace/test-runs/${project.projectShortCode}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createTestRunDTO)))
            .andExpect(status().isOk)

        // Get test case runs
        val testRuns = getTestRuns(project.projectShortCode)
        val testCaseRuns = getTestCaseRuns(project.projectShortCode, testRuns.first().testRunNumber)
        
        // Update first test case run
        val updateTestCaseRunDTO = UpdateTestCaseRunDTO(
            status = TestCaseRunStatus.PASS,
            notes = "Test passed successfully"
        )

        mockMvc.perform(put("/api/v1/workspace/test-case-runs/${testCaseRuns.first().testCaseRunID}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updateTestCaseRunDTO)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("SUCCESS"))

        // Verify the update
        val updatedTestCaseRuns = getTestCaseRuns(project.projectShortCode, testRuns.first().testRunNumber)
        assertEquals(TestCaseRunStatus.PASS, updatedTestCaseRuns.first().status)
        assertEquals("Test passed successfully", updatedTestCaseRuns.first().notes)
    }

    @Test
    fun `should retrieve next pending test case run correctly`() {
        // Create project and test cases
        val project = createProject()
        val properties = getProperties()
        createTestCase(projectShortCode = project.projectShortCode, title = "Test Case 1", properties = properties)
        createTestCase(projectShortCode = project.projectShortCode, title = "Test Case 2", properties = properties)
        createTestCase(projectShortCode = project.projectShortCode, title = "Test Case 3", properties = properties)

        // Create test run
        val testCases = getTestCases(project.projectShortCode)
        val createTestRunDTO = CreateTestRunDTO(
            title = "Test Run 1",
            description = "Test Run Description",
            testCaseIDs = testCases.map { it.testCaseID }
        )

        mockMvc.perform(post("/api/v1/workspace/test-runs/${project.projectShortCode}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createTestRunDTO)))
            .andExpect(status().isOk)

        // Get test case runs
        val testRuns = getTestRuns(project.projectShortCode)
        val testCaseRuns = getTestCaseRuns(project.projectShortCode, testRuns.first().testRunNumber)
        
        // Update first test case run
        val updateTestCaseRunDTO = UpdateTestCaseRunDTO(
            status = TestCaseRunStatus.PASS,
            notes = "Test passed"
        )

        mockMvc.perform(put("/api/v1/workspace/test-case-runs/${testCaseRuns[0].testCaseRunID}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updateTestCaseRunDTO)))
            .andExpect(status().isOk)

        // Get next test case run
        mockMvc.perform(get("/api/v1/workspace/test-case-runs/${testCaseRuns[0].testCaseRunID}/next")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.testCaseRunID").value(testCaseRuns[1].testCaseRunID.toString()))
            .andExpect(jsonPath("$.data.status").value("PENDING"))
    }

    @Test
    fun `should complete test run when all test cases are updated`() {
        // Create project and test cases
        val project = createProject()
        val properties = getProperties()
        createTestCase(projectShortCode = project.projectShortCode, title = "Test Case 1", properties = properties)
        createTestCase(projectShortCode = project.projectShortCode, title = "Test Case 2", properties = properties)

        // Create test run
        val testCases = getTestCases(project.projectShortCode)
        val createTestRunDTO = CreateTestRunDTO(
            title = "Test Run 1",
            description = "Test Run Description",
            testCaseIDs = testCases.map { it.testCaseID }
        )

        mockMvc.perform(post("/api/v1/workspace/test-runs/${project.projectShortCode}")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createTestRunDTO)))
            .andExpect(status().isOk)

        // Get test case runs
        val testRuns = getTestRuns(project.projectShortCode)
        val testCaseRuns = getTestCaseRuns(project.projectShortCode, testRuns.first().testRunNumber)
        
        // Update all test case runs
        val updateTestCaseRunDTO = UpdateTestCaseRunDTO(
            status = TestCaseRunStatus.PASS,
            notes = "Test passed"
        )

        for (testCaseRun in testCaseRuns) {
            mockMvc.perform(put("/api/v1/workspace/test-case-runs/${testCaseRun.testCaseRunID}")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateTestCaseRunDTO)))
                .andExpect(status().isOk)
        }

        // Verify test run is complete
        val updatedTestRuns = getTestRuns(project.projectShortCode)
        assertEquals(TestRunStatus.COMPLETE, updatedTestRuns.first().status)
    }

    private fun createProject(
        title: String = "Test Project",
        projectShortCode: String = "TEST",
        description: String = "Test Description"
    ): CreateWorkspaceProjectDTO {
        val project = CreateWorkspaceProjectDTO(
            title = title,
            projectShortCode = projectShortCode,
            description = description
        )

        mockMvc.perform(post("/api/v1/workspace/projects")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(project)))
            .andExpect(status().isOk)

        return project
    }

    private fun createTestCase(
        projectShortCode: String,
        title: String = "Sample Test Case",
        description: String = "Test case description",
        testInstructions: String = "1. Do this\n2. Do that",
        properties: List<PropertyConfigurationDTO>
    ): CreateTestCaseDTO {
        val propertyValues = emptyMap<UUID, String>().toMutableMap()
        for (property in properties) {
            if (property.isRequired) {
                // all required properties should have a default value
                propertyValues[property.propertyConfigurationID] = property.defaultValue!!
            }
        }

        val testCase = CreateTestCaseDTO(
            title = title,
            description = description,
            testInstructions = testInstructions,
            propertyValues = propertyValues
        )

        mockMvc.perform(post("/api/v1/workspace/test-cases/$projectShortCode")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(testCase)))
            .andExpect(status().isOk)

        return testCase
    }

    private fun getTestCases(projectShortCode: String): List<TestCaseDTO> {
        val getResult = mockMvc.perform(get("/api/v1/workspace/test-cases/$projectShortCode")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andReturn()

        val responseJson = objectMapper.readTree(getResult.response.contentAsString)
        val testCasesNode = responseJson.get("data")
        
        return objectMapper.readValue(
            testCasesNode.toString(),
            objectMapper.typeFactory.constructCollectionType(List::class.java, TestCaseDTO::class.java)
        )
    }

    private fun getProperties(): List<PropertyConfigurationDTO> {
        val getResult = mockMvc.perform(get("/api/v1/workspace/properties")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andReturn()

        val responseJson = objectMapper.readTree(getResult.response.contentAsString)
        val testCasesNode = responseJson.get("data")

        return objectMapper.readValue(
            testCasesNode.toString(),
            objectMapper.typeFactory.constructCollectionType(List::class.java, PropertyConfigurationDTO::class.java)
        )
    }

    private fun getTestRuns(projectShortCode: String): List<TestRunDTO> {
        val getResult = mockMvc.perform(get("/api/v1/workspace/test-runs/$projectShortCode")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andReturn()

        val responseJson = objectMapper.readTree(getResult.response.contentAsString)
        val testRunsNode = responseJson.get("data")

        return objectMapper.readValue(
            testRunsNode.toString(),
            objectMapper.typeFactory.constructCollectionType(List::class.java, TestRunDTO::class.java)
        )
    }

    private fun getTestCaseRuns(projectShortCode: String, testRunNumber: Long): List<TestCaseRunDTO> {
        val getResult = mockMvc.perform(get("/api/v1/workspace/test-case-runs/$projectShortCode/$testRunNumber")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andReturn()

        val responseJson = objectMapper.readTree(getResult.response.contentAsString)
        val testRunsNode = responseJson.get("data")

        return objectMapper.readValue(
            testRunsNode.toString(),
            objectMapper.typeFactory.constructCollectionType(List::class.java, TestCaseRunDTO::class.java)
        )
    }
}