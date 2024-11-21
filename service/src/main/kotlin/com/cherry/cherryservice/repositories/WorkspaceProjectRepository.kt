package com.cherry.cherryservice.repositories

import com.cherry.cherryservice.models.WorkspaceProject
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface WorkspaceProjectRepository : JpaRepository<WorkspaceProject, Long> {
    fun findByExternalID(externalID: UUID): WorkspaceProject?
}