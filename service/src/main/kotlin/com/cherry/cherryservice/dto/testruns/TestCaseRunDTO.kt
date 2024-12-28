package com.cherry.cherryservice.dto.testruns

import com.cherry.cherryservice.dto.testcases.TestCaseDTO
import com.cherry.cherryservice.models.TestCaseRun
import java.util.Date
import java.util.UUID

data class TestCaseRunDTO(
    val testCaseRunID: UUID,
    val creationDate: Date,
    val testCase: TestCaseDTO,
    val status: TestCaseRunStatus,
    val title: String,
    val description: String?,
    val testInstructions: String?,
    val notes: String?
)
