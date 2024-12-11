package com.cherry.cherryservice.repositories

import com.cherry.cherryservice.models.TestRun
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface TestRunRepository : JpaRepository<TestRun, Long> { }