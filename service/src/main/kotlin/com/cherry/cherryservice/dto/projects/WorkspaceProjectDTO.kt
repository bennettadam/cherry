package com.cherry.cherryservice.dto.projects

import java.util.Date
import java.util.UUID

data class WorkspaceProjectDTO(
    val projectID: UUID,
    val creationDate: Date,
    val title: String,
    val projectShortCode: String,
    val description: String?
)