package com.cherry.cherryservice.models

class PropertyConfiguration {

    enum class Type(val value: String) {
        TEXT("text"),
        NUMBER("number"),
        ENUM("enum")
    }
}