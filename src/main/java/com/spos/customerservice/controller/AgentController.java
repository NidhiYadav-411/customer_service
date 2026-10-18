package com.spos.customerservice.controller;

import com.spos.customerservice.model.ServiceAgent;
import com.spos.customerservice.service.SchedulingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing customer service agents.
 */
@RestController
@RequestMapping("/api/agents")
public class AgentController {

    private final SchedulingService schedulingService;

    public AgentController(SchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    @GetMapping
    public ResponseEntity<List<ServiceAgent>> getAllAgents() {
        return ResponseEntity.ok(schedulingService.getAllAgents());
    }

    @PostMapping
    public ResponseEntity<?> addAgent(@RequestBody ServiceAgent agent) {
        try {
            ServiceAgent created = schedulingService.addAgent(agent);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAgent(@PathVariable String id) {
        try {
            boolean removed = schedulingService.deleteAgent(id);
            if (removed) {
                Map<String, String> res = new HashMap<>();
                res.put("message", "Agent " + id + " deleted successfully.");
                return ResponseEntity.ok(res);
            } else {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Agent not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
            }
        } catch (IllegalStateException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
