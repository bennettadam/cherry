package com.cherry.cherryservice.dto.documents

data class GenerateDocumentDTO(
    val title: String,
    val description: String,
    val sections: List<Section>
)

data class Section(
    val title: String,
    val subsections: List<Subsection>
)

data class Subsection(
    val title: String,
    val body: String
)