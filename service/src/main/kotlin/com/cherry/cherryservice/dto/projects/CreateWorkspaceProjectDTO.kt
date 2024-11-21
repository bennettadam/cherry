package com.cherry.cherryservice.dto.projects

data class CreateWorkspaceProjectDTO(
    val name: String,
    val projectShortCode: String,
    val description: String?
)