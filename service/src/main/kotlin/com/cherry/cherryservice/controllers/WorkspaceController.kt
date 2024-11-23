package com.cherry.cherryservice.controllers

import com.cherry.cherryservice.dto.*
import com.cherry.cherryservice.dto.projects.CreateWorkspaceProjectDTO
import com.cherry.cherryservice.dto.testcases.CreateTestCaseDTO
import com.cherry.cherryservice.dto.testcases.TestCaseDTO
import com.cherry.cherryservice.services.WorkspaceService
import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.http.ResponseEntity
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
        return ResponseEntity.ok(FetchResponse(projects))
    }

    @PostMapping("/projects")
    fun createProject(@RequestBody request: CreateWorkspaceProjectDTO): ResponseEntity<Any> {
        workspaceService.createProject(request)
        return ResponseEntity.ok("Success")
    }

    @GetMapping("/projects/{projectID}/test-cases")
    fun retrieveTestCases(@PathVariable projectID: UUID): ResponseEntity<Any> {
        val testCases = workspaceService.retrieveTestCases(projectID)
        return ResponseEntity.ok(FetchResponse(testCases))
    }

    @PutMapping("/projects/{projectID}/test-cases")
    fun updateTestCase(@PathVariable projectID: UUID, @RequestBody request: UpdateDTO<CreateTestCaseDTO>): ResponseEntity<Any> {
        workspaceService.updateTestCase(request)
        return ResponseEntity.ok("Success")
    }

    @PostMapping("/projects/{projectID}/test-cases")
    fun createTestCase(@PathVariable projectID: UUID, @RequestBody request: CreateTestCaseDTO): ResponseEntity<Any> {
        workspaceService.createTestCase(projectID, request)
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
}