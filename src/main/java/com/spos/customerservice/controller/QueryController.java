package com.spos.customerservice.controller;

import com.spos.customerservice.model.CustomerQuery;
import com.spos.customerservice.service.SchedulingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing customer service queries.
 */
@RestController
@RequestMapping("/api/queries")
public class QueryController {

    private final SchedulingService schedulingService;

    public QueryController(SchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    @GetMapping
    public ResponseEntity<List<CustomerQuery>> getAllQueries() {
        return ResponseEntity.ok(schedulingService.getAllQueries());
    }

    @PostMapping
    public ResponseEntity<?> addQuery(@RequestBody CustomerQuery query) {
        if (query.getCustomerName() == null || query.getCustomerName().trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Customer name is required.");
            return ResponseEntity.badRequest().body(err);
        }
        if (query.getQueryDescription() == null || query.getQueryDescription().trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Query description is required.");
            return ResponseEntity.badRequest().body(err);
        }
        if (query.getEstimatedTime() <= 0) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Estimated processing time must be greater than 0.");
            return ResponseEntity.badRequest().body(err);
        }

        query.setCustomerName(query.getCustomerName().trim());
        query.setQueryDescription(query.getQueryDescription().trim());
        CustomerQuery created = schedulingService.addQuery(query);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuery(@PathVariable String id) {
        boolean removed = schedulingService.deleteQuery(id);
        if (removed) {
            Map<String, String> res = new HashMap<>();
            res.put("message", "Query " + id + " deleted successfully.");
            return ResponseEntity.ok(res);
        } else {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Query not found or could not be deleted.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetQueries() {
        schedulingService.resetQueryStatuses();
        Map<String, String> res = new HashMap<>();
        res.put("message", "All queries reset to Pending state.");
        return ResponseEntity.ok(res);
    }
}
