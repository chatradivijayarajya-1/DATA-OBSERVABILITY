
package com.observability.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.observability.backend.entity.Pipeline;
import com.observability.backend.service.PipelineService;

@RestController
@RequestMapping("/api/pipelines")
@CrossOrigin(origins = "http://localhost:5173")
public class PipelineController {

    private final PipelineService service;

    public PipelineController(PipelineService service) {
        this.service = service;
    }

    // Get all pipelines
    @GetMapping
    public List<Pipeline> getAllPipelines() {
        return service.getAllPipelines();
    }

    // Add a new pipeline
    @PostMapping
    public Pipeline addPipeline(@RequestBody Pipeline pipeline) {
        return service.addPipeline(pipeline);
    }

    // Delete a pipeline
    @DeleteMapping("/{id}")
    public String deletePipeline(@PathVariable Long id) {
        service.deletePipeline(id);
        return "Pipeline deleted successfully!";
    }
}
