package com.cherry.cherryservice.controllers

import com.cherry.cherryservice.dto.*
import com.cherry.cherryservice.dto.projects.CreateWorkspaceProjectDTO
import com.cherry.cherryservice.dto.testcases.CreateTestCaseDTO
import com.cherry.cherryservice.dto.testcases.TestCaseDTO
import com.cherry.cherryservice.dto.testruns.CreateTestRunDTO
import com.cherry.cherryservice.dto.testruns.UpdateTestCaseRunDTO
import com.cherry.cherryservice.dto.testruns.UpdateTestRunDTO
import com.cherry.cherryservice.services.WorkspaceService
import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
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
        return ResponseEntity.ok(FetchResponse(projects))
    }

    @PostMapping("/projects")
    fun createProject(@RequestBody request: CreateWorkspaceProjectDTO): ResponseEntity<Any> {
        workspaceService.createProject(request)
        return ResponseEntity.ok("Success")
    }

    @GetMapping("test-cases/{projectShortCode}")
    fun retrieveTestCases(@PathVariable projectShortCode: String): ResponseEntity<Any> {
        val testCases = workspaceService.retrieveTestCases(projectShortCode)
        return ResponseEntity.ok(FetchResponse(testCases))
    }

    @PostMapping("/test-cases/{projectShortCode}")
    fun createTestCase(@PathVariable projectShortCode: String, @RequestBody request: CreateTestCaseDTO): ResponseEntity<Any> {
        workspaceService.createTestCase(projectShortCode, request)
        return ResponseEntity.ok("Success")
    }

    @PutMapping("/test-cases/{testCaseID}")
    fun updateTestCase(@PathVariable testCaseID: UUID, @RequestBody request: CreateTestCaseDTO): ResponseEntity<Any> {
        workspaceService.updateTestCase(testCaseID, request)
        return ResponseEntity.ok("Success")
    }

    @GetMapping("/properties")
    fun getWorkspaceProperties(): ResponseEntity<FetchResponse<Any>> {
        val properties = workspaceService.retrieveProperties()
        return ResponseEntity.ok(FetchResponse(properties))
    }

    @PutMapping("/properties")
    fun updateProperties(@RequestBody request: UpdatePropertyConfigurationDTO): ResponseEntity<Any> {
        workspaceService.updateProperty(request)
        return ResponseEntity.ok("Success")
    }

    @PostMapping("/properties")
    fun createProperty(@RequestBody request: CreatePropertyConfigurationDTO): ResponseEntity<Any> {
        try {
            workspaceService.createProperty(request)
            return ResponseEntity.ok("Success")
        }
        catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(e.message)
        }
    }

    @DeleteMapping("/properties/{propertyConfigurationID}")
    fun deleteProperty(@PathVariable propertyConfigurationID: UUID): ResponseEntity<Any> {
        try {
            workspaceService.deleteProperty(propertyConfigurationID)
            return ResponseEntity.ok("Success")
        }
        catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/test-runs/{projectShortCode}")
    fun retrieveTestRuns(@PathVariable projectShortCode: String): ResponseEntity<Any> {
        try {
            val testRuns = workspaceService.retrieveTestRuns(projectShortCode)
            return ResponseEntity.ok(FetchResponse(testRuns))
        }
        catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/test-runs/{projectShortCode}")
    fun createTestRun(@PathVariable projectShortCode: String, @RequestBody request: CreateTestRunDTO): ResponseEntity<Any> {
        try {
            workspaceService.createTestRun(projectShortCode, request)
            return ResponseEntity.ok("Success")
        }
        catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(e.message)
        }
    }

    @PutMapping("/test-runs/{testRunID}")
    fun updateTestRun(@PathVariable testRunID: UUID, @RequestBody request: UpdateTestRunDTO): ResponseEntity<Any> {
        try {
            workspaceService.updateTestRun(testRunID, request)
            return ResponseEntity.ok("Success")
        }
        catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(e.message)
        }
    }

    @DeleteMapping("/test-runs/{testRunID}")
    fun deleteTestRun(@PathVariable testRunID: UUID): ResponseEntity<Any> {
        try {
            workspaceService.deleteTestRun(testRunID)
            return ResponseEntity.ok("Success")
        }
        catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/test-case-runs/{projectShortCode}/{testRunNumber}")
    fun retrieveTestCaseRuns(@PathVariable projectShortCode: String, @PathVariable testRunNumber: Long): ResponseEntity<Any> {
        try {
            val testCaseRuns = workspaceService.retrieveTestCaseRuns(projectShortCode, testRunNumber)
            return ResponseEntity.ok(FetchResponse(testCaseRuns))
        }
        catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(e.message)
        }
    }

    @PutMapping("/test-case-runs/{testCaseRunID}")
    fun updateTestCaseRun(@PathVariable testCaseRunID: UUID, @RequestBody request: UpdateTestCaseRunDTO): ResponseEntity<Any> {
        try {
            workspaceService.updateTestCaseRun(testCaseRunID, request)
            return ResponseEntity.ok("Success")
        }
        catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(e.message)
        }
    }

    @DeleteMapping("/test-case-runs/{testCaseRunID}")
    fun deleteTestCaseRun(@PathVariable testCaseRunID: UUID): ResponseEntity<Any> {
        try {
            workspaceService.deleteTestCaseRun(testCaseRunID)
            return ResponseEntity.ok("Success")
        }
        catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest().body(e.message)
        }
    }
}