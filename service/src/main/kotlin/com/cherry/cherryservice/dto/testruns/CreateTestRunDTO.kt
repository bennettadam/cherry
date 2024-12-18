package com.cherry.cherryservice.dto.testruns

import java.util.UUID

data class CreateTestRunDTO(
    val title: String,
    val description: String?,
    val testCaseIDs: List<UUID>,
)