package com.cherry.cherryservice.dto.testruns

data class UpdateTestRunDTO(
    val title: String,
    val description: String?,
    val status: TestRunStatus
) 