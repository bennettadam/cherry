package com.cherry.cherryservice.models

import com.cherry.cherryservice.dto.PropertyConfigurationSource
import com.cherry.cherryservice.dto.testruns.TestRunStatus
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.util.*

@Entity(name = "test_runs")
class TestRun (
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    val project: WorkspaceProject,

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    var status: TestRunStatus,

    @Column(name = "title")
    var title: String,

    @Column(name = "description")
    var description: String?,
)