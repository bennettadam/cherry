package com.cherry.cherryservice.repositories

import com.cherry.cherryservice.models.TestCaseRun
import org.springframework.data.jpa.repository.JpaRepository

interface TestCaseRunRepository : JpaRepository<TestCaseRun, Long> { }