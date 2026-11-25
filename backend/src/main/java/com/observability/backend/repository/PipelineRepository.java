
package com.observability.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.observability.backend.entity.Pipeline;

public interface PipelineRepository
        extends JpaRepository<Pipeline, Long> {

}
