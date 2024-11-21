package com.cherry.cherryservice.models

import com.cherry.cherryservice.dto.projects.WorkspaceProjectDTO
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.util.*

@Entity(name = "workspace_projects")
class WorkspaceProject(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "external_id")
    val externalID: UUID = UUID.randomUUID(),

    @Column(name = "creation_date")
    @CreationTimestamp
    val creationDate: Date = Date(),

    @Column(name = "modify_date")
    @UpdateTimestamp
    val modifyDate: Date = Date(),

    @Column(name = "name")
    var name: String,

    @Column(name = "project_short_code")
    var projectShortCode: String,

    @Column(name = "description")
    var description: String?,
) {

    fun toDTO(): WorkspaceProjectDTO {
        return WorkspaceProjectDTO(externalID, creationDate, name, projectShortCode, description)
    }
}