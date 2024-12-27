package com.cherry.cherryservice.controllers

import com.cherry.cherryservice.dto.*
import com.cherry.cherryservice.dto.projects.CreateWorkspaceProjectDTO
import com.cherry.cherryservice.dto.properties.CreatePropertyConfigurationDTO
import com.cherry.cherryservice.dto.properties.UpdatePropertyConfigurationDTO
import com.cherry.cherryservice.dto.testcases.CreateTestCaseDTO
import com.cherry.cherryservice.dto.testruns.CreateTestRunDTO
import com.cherry.cherryservice.dto.testruns.UpdateTestCaseRunDTO
import com.cherry.cherryservice.dto.testruns.UpdateTestRunDTO
import com.cherry.cherryservice.services.WorkspaceService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/workspace")
class WorkspaceController(
    private val workspaceService: WorkspaceService
) {

    @GetMapping("/projects")
    fun retrieveProjects(): ResponseEntity<Any> {
        val projects = workspaceService.retrieveProjects()
        return ResponseEntity.ok(DataResponse(data = projects))
    }

    @PostMapping("/projects")
    fun createProject(@RequestBody request: CreateWorkspaceProjectDTO): ResponseEntity<Any> {
        workspaceService.createProject(request)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }

    @GetMapping("test-cases/{projectShortCode}")
    fun retrieveTestCases(@PathVariable projectShortCode: String): ResponseEntity<Any> {
        val testCases = workspaceService.retrieveTestCases(projectShortCode)
        return ResponseEntity.ok(DataResponse(data = testCases))
    }

    @PostMapping("/test-cases/{projectShortCode}")
    fun createTestCase(@PathVariable projectShortCode: String, @RequestBody request: CreateTestCaseDTO): ResponseEntity<Any> {
        workspaceService.createTestCase(projectShortCode, request)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }

    @PutMapping("/test-cases/{testCaseID}")
    fun updateTestCase(@PathVariable testCaseID: UUID, @RequestBody request: CreateTestCaseDTO): ResponseEntity<Any> {
        workspaceService.updateTestCase(testCaseID, request)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }

    @DeleteMapping("/test-cases/{testCaseID}")
    fun deleteTestCase(@PathVariable testCaseID: UUID): ResponseEntity<Any> {
        workspaceService.deleteTestCase(testCaseID)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }

    @GetMapping("/properties")
    fun getWorkspaceProperties(): ResponseEntity<Any> {
        val properties = workspaceService.retrieveProperties()
        return ResponseEntity.ok(DataResponse(data = properties))
    }

    @PutMapping("/properties")
    fun updateProperties(@RequestBody request: UpdatePropertyConfigurationDTO): ResponseEntity<Any> {
        workspaceService.updateProperty(request)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }

    @PostMapping("/properties")
    fun createProperty(@RequestBody request: CreatePropertyConfigurationDTO): ResponseEntity<Any> {
        workspaceService.createProperty(request)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }

    @DeleteMapping("/properties/{propertyConfigurationID}")
    fun deleteProperty(@PathVariable propertyConfigurationID: UUID): ResponseEntity<Any> {
        workspaceService.deleteProperty(propertyConfigurationID)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }

    @GetMapping("/test-runs/{projectShortCode}")
    fun retrieveTestRuns(@PathVariable projectShortCode: String): ResponseEntity<Any> {
        val testRuns = workspaceService.retrieveTestRuns(projectShortCode)
        return ResponseEntity.ok(DataResponse(data = testRuns))
    }

    @PostMapping("/test-runs/{projectShortCode}")
    fun createTestRun(@PathVariable projectShortCode: String, @RequestBody request: CreateTestRunDTO): ResponseEntity<Any> {
        workspaceService.createTestRun(projectShortCode, request)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }

    @PutMapping("/test-runs/{testRunID}")
    fun updateTestRun(@PathVariable testRunID: UUID, @RequestBody request: UpdateTestRunDTO): ResponseEntity<Any> {
        workspaceService.updateTestRun(testRunID, request)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }

    @DeleteMapping("/test-runs/{testRunID}")
    fun deleteTestRun(@PathVariable testRunID: UUID): ResponseEntity<Any> {
        workspaceService.deleteTestRun(testRunID)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }

    @GetMapping("/test-case-runs/{projectShortCode}/{testRunNumber}")
    fun retrieveTestCaseRuns(@PathVariable projectShortCode: String, @PathVariable testRunNumber: Long): ResponseEntity<Any> {
        val testCaseRuns = workspaceService.retrieveTestCaseRuns(projectShortCode, testRunNumber)
        return ResponseEntity.ok(DataResponse(data = testCaseRuns))
    }

    @GetMapping("/test-case-runs/{testCaseRunID}/next")
    fun retrieveNextTestCaseRun(@PathVariable testCaseRunID: UUID): ResponseEntity<Any> {
        val testCaseRun = workspaceService.retrieveNextTestCaseRun(testCaseRunID)
        return ResponseEntity.ok(DataResponse(data = testCaseRun))
    }

    @PutMapping("/test-case-runs/{testCaseRunID}")
    fun updateTestCaseRun(@PathVariable testCaseRunID: UUID, @RequestBody request: UpdateTestCaseRunDTO): ResponseEntity<Any> {
        workspaceService.updateTestCaseRun(testCaseRunID, request)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }

    @DeleteMapping("/test-case-runs/{testCaseRunID}")
    fun deleteTestCaseRun(@PathVariable testCaseRunID: UUID): ResponseEntity<Any> {
        workspaceService.deleteTestCaseRun(testCaseRunID)
        return ResponseEntity.ok(StatusResponse(FetchResponseStatus.SUCCESS))
    }
}