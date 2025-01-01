package com.cherry.cherryservice

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(args = ["--perform-migration"])
class CherryServiceApplicationTests {

    @Test
    fun contextLoads() {
    }

}
