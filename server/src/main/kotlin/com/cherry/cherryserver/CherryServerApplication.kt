package com.cherry.cherryserver

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class CherryServerApplication

fun main(args: Array<String>) {
    runApplication<CherryServerApplication>(*args)
}
