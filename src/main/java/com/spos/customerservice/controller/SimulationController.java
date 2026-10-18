package com.spos.customerservice.controller;

import com.spos.customerservice.model.CustomerQuery;
import com.spos.customerservice.model.ServiceAgent;
import com.spos.customerservice.model.SimulationResult;
import com.spos.customerservice.service.SchedulingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for executing and monitoring the Round Robin simulation.
 */
@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final SchedulingService schedulingService;

    public SimulationController(SchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    /**
     * Executes the Round Robin scheduling algorithm in Java backend.
     * Returns full step-by-step state, queues, timeline, and final calculated metrics.
     */
    @PostMapping("/run")
    public ResponseEntity<?> runSimulation(@RequestParam(defaultValue = "2") int quantum) {
        try {
            SimulationResult result = schedulingService.runSimulation(quantum);
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    /**
     * Resets queries and agents to pending state without losing data.
     */
    @PostMapping("/reset")
    public ResponseEntity<?> resetSimulation() {
        schedulingService.resetQueryStatuses();
        Map<String, String> res = new HashMap<>();
        res.put("message", "Simulation state reset successfully.");
        return ResponseEntity.ok(res);
    }

    /**
     * Restores the default demo queries and agents.
     */
    @PostMapping("/reset-defaults")
    public ResponseEntity<?> resetDefaults() {
        schedulingService.initDefaultData();
        Map<String, String> res = new HashMap<>();
        res.put("message", "Default sample data restored successfully.");
        return ResponseEntity.ok(res);
    }

    /**
     * Returns real-time summary statistics for dashboard.
     */
    @GetMapping("/status")
    public ResponseEntity<?> getDashboardStatus() {
        List<CustomerQuery> queries = schedulingService.getAllQueries();
        List<ServiceAgent> agents = schedulingService.getAllAgents();

        long pendingCount = queries.stream().filter(q -> "PENDING".equalsIgnoreCase(q.getStatus())).count();
        long inProgressCount = queries.stream().filter(q -> "IN_PROGRESS".equalsIgnoreCase(q.getStatus())).count();
        long completedCount = queries.stream().filter(q -> "COMPLETED".equalsIgnoreCase(q.getStatus())).count();
        long availableAgents = agents.stream().filter(a -> "AVAILABLE".equalsIgnoreCase(a.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalQueries", queries.size());
        stats.put("pendingQueries", pendingCount);
        stats.put("inProgressQueries", inProgressCount);
        stats.put("completedQueries", completedCount);
        stats.put("totalAgents", agents.size());
        stats.put("availableAgents", availableAgents);
        stats.put("defaultQuantum", 2);

        return ResponseEntity.ok(stats);
    }
}
