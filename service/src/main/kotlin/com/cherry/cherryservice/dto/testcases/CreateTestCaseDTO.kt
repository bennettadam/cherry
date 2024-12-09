package com.cherry.cherryservice.dto.testcases

import java.util.UUID

data class CreateTestCaseDTO(
    val title: String,
    val description: String?,
    val testInstructions: String?,
    val propertyValues: Map<UUID, String>
)