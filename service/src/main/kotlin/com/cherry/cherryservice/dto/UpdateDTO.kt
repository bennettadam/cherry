package com.cherry.cherryservice.dto

import java.util.UUID

data class UpdateDTO<T>(
    val id: UUID,
    val data: T
)