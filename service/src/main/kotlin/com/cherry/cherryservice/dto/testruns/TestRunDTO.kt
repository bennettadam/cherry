package com.cherry.cherryservice.dto.testruns

import java.util.Date
import java.util.UUID

data class TestRunDTO(
    val testRunID: UUID,
    val creationDate: Date,
    val status: TestRunStatus,
    val title: String,
    val description: String?
)