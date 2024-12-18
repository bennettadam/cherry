package com.cherry.cherryservice.repositories

import com.cherry.cherryservice.models.TestRun
import com.cherry.cherryservice.models.WorkspaceProject
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface TestRunRepository : JpaRepository<TestRun, Long> {
    fun findByExternalID(externalID: UUID): TestRun?

    fun findAllByProject(project: WorkspaceProject): List<TestRun>
}