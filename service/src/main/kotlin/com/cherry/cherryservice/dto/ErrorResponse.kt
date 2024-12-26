package com.cherry.cherryservice.dto

data class ErrorResponse(
    val status: FetchResponseStatus = FetchResponseStatus.ERROR,
    val error: String,
    val message: String
)