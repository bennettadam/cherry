package com.cherry.cherryservice.dto.testcases

import java.util.Date
import java.util.UUID

data class TestCaseDTO(
    val testCaseID: UUID,
    val projectID: UUID,
    val creationDate: Date,
    val testCaseNumber: Long,
    val title: String,
    val description: String?,
    val testInstructions: String?
)