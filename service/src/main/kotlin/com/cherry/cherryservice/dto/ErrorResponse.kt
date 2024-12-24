package com.cherry.cherryservice.dto

data class ErrorResponse(
    val error: String,
    val message: String?
)