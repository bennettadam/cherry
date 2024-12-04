package com.cherry.cherryservice.dto.testcases

import java.util.UUID

data class TestCasePropertyValueDTO(
    val propertyConfigurationID: UUID,
    val value: String?
)