package com.cherry.cherryservice

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class CherryServiceApplication

fun main(args: Array<String>) {
    runApplication<CherryServiceApplication>(*args)
}
