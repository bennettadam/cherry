package com.cherry.cherryservice.dto.projects

data class CreateWorkspaceProjectDTO(
    val title: String,
    val projectShortCode: String,
    val description: String?
)