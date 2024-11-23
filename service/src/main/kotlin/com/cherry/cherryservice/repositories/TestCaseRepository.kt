package com.cherry.cherryservice.repositories

import com.cherry.cherryservice.models.PropertyConfiguration
import com.cherry.cherryservice.models.TestCase
import com.cherry.cherryservice.models.WorkspaceProject
import jakarta.transaction.Transactional
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface TestCaseRepository : JpaRepository<TestCase, Long> {
    fun findByProject(project: WorkspaceProject): List<TestCase>

    fun countByProject(project: WorkspaceProject): Long

    fun findByExternalID(externalID: UUID): TestCase?
}