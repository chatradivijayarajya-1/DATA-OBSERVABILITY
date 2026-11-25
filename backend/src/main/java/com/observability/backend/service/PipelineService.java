
package com.observability.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.observability.backend.entity.Pipeline;
import com.observability.backend.repository.PipelineRepository;

@Service
public class PipelineService {

    private final PipelineRepository repository;

    public PipelineService(PipelineRepository repository) {
        this.repository = repository;
    }

    public List<Pipeline> getAllPipelines() {
        return repository.findAll();
    }

    public Pipeline addPipeline(Pipeline pipeline) {

        pipeline.setCreatedAt(LocalDateTime.now());

        return repository.save(pipeline);
    }

    public void deletePipeline(Long id) {
        repository.deleteById(id);
    }
}
