package com.cherry.cherryservice.dto

data class OptionalUpdate<T> (
    val shouldSet: Boolean,
    val value: T?
)