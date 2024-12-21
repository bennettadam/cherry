package com.cherry.cherryservice.repositories

import com.cherry.cherryservice.models.TestCaseRun
import com.cherry.cherryservice.models.TestRun
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TestCaseRunRepository : JpaRepository<TestCaseRun, Long> {
    fun findByExternalID(externalID: UUID): TestCaseRun?

    fun findAllByTestRun(testRun: TestRun): List<TestCaseRun>

    fun deleteAllByTestRun(testRun: TestRun)

    fun deleteByExternalID(externalID: UUID)
}