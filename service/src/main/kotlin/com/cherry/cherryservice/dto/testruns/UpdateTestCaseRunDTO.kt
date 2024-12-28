package com.cherry.cherryservice.dto.testruns

data class UpdateTestCaseRunDTO(
    val status: TestCaseRunStatus,
    val notes: String?,
)