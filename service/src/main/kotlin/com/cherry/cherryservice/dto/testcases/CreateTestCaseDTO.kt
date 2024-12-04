package com.cherry.cherryservice.dto.testcases

data class CreateTestCaseDTO(
    val title: String,
    val description: String?,
    val testInstructions: String?,
    val propertyValues: List<TestCasePropertyValueDTO>?
)