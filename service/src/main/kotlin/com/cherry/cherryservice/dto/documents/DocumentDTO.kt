package com.cherry.cherryservice.dto.documents

data class DocumentDTO<T> (
    val fileName: String,
    val data: T
)