package com.cherry.cherryservice.controllers

import com.cherry.cherryservice.dto.CreatePropertyConfigurationDTO
import com.cherry.cherryservice.dto.FetchResponse
import com.cherry.cherryservice.dto.PropertyConfigurationDTO
import com.cherry.cherryservice.dto.UpdatePropertyConfigurationDTO
import com.cherry.cherryservice.services.WorkspaceService
import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/workspace")
class WorkspaceController(
    private val workspaceService: WorkspaceService
) {
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