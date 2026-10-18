package com.spos.customerservice.service;

import com.spos.customerservice.model.CustomerQuery;
import com.spos.customerservice.model.ServiceAgent;
import com.spos.customerservice.model.SimulationResult;
import com.spos.customerservice.model.SimulationStep;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service implementing Round Robin query scheduling with multiple service agents.
 * Keeps an in-memory repository of customer queries and service agents.
 */
@Service
public class SchedulingService {

    private final List<CustomerQuery> queries = new ArrayList<>();
    private final List<ServiceAgent> agents = new ArrayList<>();
    private final AtomicInteger queryCounter = new AtomicInteger(1);
    private final AtomicInteger agentCounter = new AtomicInteger(1);

    private final String[] queryColorPalette = {
            "#2563eb", "#7c3aed", "#059669", "#d97706",
            "#db2777", "#0891b2", "#4f46e5", "#ea580c"
    };

    private final String[] agentColorPalette = {
            "#1e40af", "#6d28d9", "#047857", "#b45309", "#be185d"
    };

    public SchedulingService() {
        initDefaultData();
    }

    /**
     * Initializes pre-seeded sample data so the application is immediately interactive.
     */
    public synchronized void initDefaultData() {
        queries.clear();
        agents.clear();
        queryCounter.set(1);
        agentCounter.set(1);

        // Pre-seeded agents
        addAgent(new ServiceAgent(null, "Agent Alex", agentColorPalette[0]));
        addAgent(new ServiceAgent(null, "Agent Sarah", agentColorPalette[1]));
        addAgent(new ServiceAgent(null, "Agent David", agentColorPalette[2]));

        // Pre-seeded queries with realistic customer scenarios
        addQuery(new CustomerQuery(null, "Rahul Sharma", "Payment Gateway Timeout", 5, "Auto"));
        addQuery(new CustomerQuery(null, "Priya Patel", "Package Delivery Delay", 3, "Auto"));
        addQuery(new CustomerQuery(null, "Amit Kumar", "Account Password Reset", 2, "Auto"));
        addQuery(new CustomerQuery(null, "Sneha Rao", "Billing Invoice Dispute", 6, "Auto"));
        addQuery(new CustomerQuery(null, "Vikram Singh", "Refund Status Inquiry", 4, "Auto"));
    }

    // ================= Query Operations =================

    public synchronized List<CustomerQuery> getAllQueries() {
        List<CustomerQuery> copyList = new ArrayList<>();
        for (CustomerQuery q : queries) {
            copyList.add(new CustomerQuery(q));
        }
        return copyList;
    }

    public synchronized CustomerQuery addQuery(CustomerQuery query) {
        if (query.getId() == null || query.getId().trim().isEmpty()) {
            query.setId("Q" + queryCounter.getAndIncrement());
        }
        if (query.getRemainingTime() <= 0) {
            query.setRemainingTime(query.getEstimatedTime());
        }
        query.setStatus("PENDING");

        int colorIdx = (queries.size()) % queryColorPalette.length;
        query.setColor(queryColorPalette[colorIdx]);

        queries.add(query);
        return new CustomerQuery(query);
    }

    public synchronized boolean deleteQuery(String id) {
        return queries.removeIf(q -> q.getId().equalsIgnoreCase(id));
    }

    public synchronized void resetQueryStatuses() {
        for (CustomerQuery q : queries) {
            q.setStatus("PENDING");
            q.setRemainingTime(q.getEstimatedTime());
            q.setCompletionTime(0);
            q.setTurnaroundTime(0);
            q.setWaitingTime(0);
        }
        for (ServiceAgent a : agents) {
            a.setStatus("AVAILABLE");
            a.setCurrentCustomer("None (Idle)");
            a.setCurrentQueryDescription("-");
            a.setQueriesHandled(0);
            a.setTotalTimeSpent(0);
        }
    }

    // ================= Agent Operations =================

    public synchronized List<ServiceAgent> getAllAgents() {
        List<ServiceAgent> copyList = new ArrayList<>();
        for (ServiceAgent a : agents) {
            copyList.add(new ServiceAgent(a));
        }
        return copyList;
    }

    public synchronized ServiceAgent addAgent(ServiceAgent agent) {
        if (agent.getName() == null || agent.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Agent name cannot be empty");
        }

        // Check for duplicate names
        boolean exists = agents.stream().anyMatch(a -> a.getName().equalsIgnoreCase(agent.getName().trim()));
        if (exists) {
            throw new IllegalArgumentException("Agent with name '" + agent.getName().trim() + "' already exists");
        }

        agent.setName(agent.getName().trim());
        if (agent.getId() == null || agent.getId().trim().isEmpty()) {
            agent.setId("A" + agentCounter.getAndIncrement());
        }
        if (agent.getAvatarColor() == null || agent.getAvatarColor().trim().isEmpty()) {
            int colorIdx = (agents.size()) % agentColorPalette.length;
            agent.setAvatarColor(agentColorPalette[colorIdx]);
        }
        agent.setStatus("AVAILABLE");
        agent.setCurrentCustomer("None (Idle)");
        agent.setCurrentQueryDescription("-");

        agents.add(agent);
        return new ServiceAgent(agent);
    }

    public synchronized boolean deleteAgent(String id) {
        if (agents.size() <= 1) {
            throw new IllegalStateException("At least one agent must be present in the service center.");
        }
        return agents.removeIf(a -> a.getId().equalsIgnoreCase(id));
    }

    // ================= Round Robin Algorithm Simulation =================

    /**
     * Executes the Round Robin scheduling algorithm.
     * Uses a Queue to maintain pending queries and a time quantum to limit each turn.
     * Distributes scheduling turns among agents in round-robin order.
     * Generates a step-by-step history of the execution.
     *
     * @param timeQuantum Maximum time slice each query can process per turn
     * @return SimulationResult containing steps, timeline, and metrics
     */
    public synchronized SimulationResult runSimulation(int timeQuantum) {
        if (timeQuantum <= 0) {
            timeQuantum = 2; // Default time quantum
        }

        if (queries.isEmpty()) {
            throw new IllegalStateException("No customer queries to schedule. Please add queries first.");
        }
        if (agents.isEmpty()) {
            throw new IllegalStateException("No agents available. Please add at least one agent.");
        }

        // 1. Prepare clean copies of queries and agents for the simulation run
        resetQueryStatuses();

        Queue<CustomerQuery> readyQueue = new LinkedList<>();
        Map<String, CustomerQuery> queryMetricsMap = new LinkedHashMap<>();

        for (int i = 0; i < queries.size(); i++) {
            CustomerQuery original = queries.get(i);
            CustomerQuery simCopy = new CustomerQuery(original);
            simCopy.setArrivalTime(i); // Sequence arrival time
            simCopy.setRemainingTime(original.getEstimatedTime());
            simCopy.setStatus("PENDING");
            readyQueue.add(simCopy);
            queryMetricsMap.put(simCopy.getId(), simCopy);
        }

        // Prepare agents simulation list
        List<ServiceAgent> simAgents = new ArrayList<>();
        for (ServiceAgent a : agents) {
            ServiceAgent agentCopy = new ServiceAgent(a);
            agentCopy.setStatus("AVAILABLE");
            agentCopy.setCurrentCustomer("None (Idle)");
            agentCopy.setCurrentQueryDescription("-");
            agentCopy.setQueriesHandled(0);
            agentCopy.setTotalTimeSpent(0);
            simAgents.add(agentCopy);
        }

        List<SimulationStep> steps = new ArrayList<>();
        List<String> timelineEntries = new ArrayList<>();

        int currentTime = 0;
        int agentIndex = 0;
        int stepNumber = 1;

        // 2. Execute Round Robin queue processing loop
        while (!readyQueue.isEmpty()) {
            // Snapshot of ready queue before popping
            List<CustomerQuery> readyQueueBefore = cloneQueue(readyQueue);

            // Pop first query from ready queue
            CustomerQuery currentQuery = readyQueue.poll();

            // Select next agent in round-robin sequence
            ServiceAgent currentAgent = simAgents.get(agentIndex % simAgents.size());
            agentIndex++;

            int remainingBefore = currentQuery.getRemainingTime();
            int timeSpentInStep = Math.min(timeQuantum, remainingBefore);
            int startTime = currentTime;
            int endTime = currentTime + timeSpentInStep;
            currentTime = endTime;

            int remainingAfter = remainingBefore - timeSpentInStep;
            currentQuery.setRemainingTime(remainingAfter);

            boolean isCompleted = (remainingAfter == 0);
            String statusAfterStep;

            if (isCompleted) {
                statusAfterStep = "COMPLETED";
                currentQuery.setStatus("COMPLETED");
                currentQuery.setCompletionTime(endTime);

                int turnaroundTime = endTime - currentQuery.getArrivalTime();
                int waitingTime = turnaroundTime - currentQuery.getEstimatedTime();
                if (waitingTime < 0) waitingTime = 0;

                currentQuery.setTurnaroundTime(turnaroundTime);
                currentQuery.setWaitingTime(waitingTime);

                // Update metric in master map
                CustomerQuery metricQuery = queryMetricsMap.get(currentQuery.getId());
                if (metricQuery != null) {
                    metricQuery.setStatus("COMPLETED");
                    metricQuery.setCompletionTime(endTime);
                    metricQuery.setTurnaroundTime(turnaroundTime);
                    metricQuery.setWaitingTime(waitingTime);
                    metricQuery.setRemainingTime(0);
                }
            } else {
                statusAfterStep = "REQUEUED";
                currentQuery.setStatus("IN_PROGRESS");
                // Place back at the end of the ready queue
                readyQueue.add(currentQuery);
            }

            // Update agent workload metrics
            currentAgent.setQueriesHandled(currentAgent.getQueriesHandled() + 1);
            currentAgent.setTotalTimeSpent(currentAgent.getTotalTimeSpent() + timeSpentInStep);
            currentAgent.setStatus("BUSY");
            currentAgent.setCurrentCustomer(currentQuery.getCustomerName());
            currentAgent.setCurrentQueryDescription(currentQuery.getQueryDescription());

            // Build snapshot of agent states for this step
            List<ServiceAgent> agentStatesSnapshot = new ArrayList<>();
            for (ServiceAgent a : simAgents) {
                ServiceAgent snap = new ServiceAgent(a);
                if (snap.getId().equals(currentAgent.getId())) {
                    snap.setStatus("BUSY");
                    snap.setCurrentCustomer(currentQuery.getCustomerName());
                    snap.setCurrentQueryDescription(currentQuery.getQueryDescription());
                } else {
                    snap.setStatus("AVAILABLE");
                    snap.setCurrentCustomer("Idle");
                    snap.setCurrentQueryDescription("-");
                }
                agentStatesSnapshot.add(snap);
            }

            // Snapshot of ready queue after processing this turn
            List<CustomerQuery> readyQueueAfter = cloneQueue(readyQueue);

            // Construct explanation for beginner viva understanding
            String explanation;
            if (isCompleted) {
                explanation = String.format(
                        "%s's query (%s) had %d time unit(s) remaining. With time quantum = %d, %s processed it for %d unit(s) and COMPLETED the query at time %d! It leaves the ready queue.",
                        currentQuery.getCustomerName(), currentQuery.getQueryDescription(), remainingBefore, timeQuantum,
                        currentAgent.getName(), timeSpentInStep, endTime
                );
            } else {
                explanation = String.format(
                        "%s's query (%s) had %d time unit(s) remaining. The time quantum is %d. %s processed it for %d unit(s). %d unit(s) remain. Since it is not finished, it returns to the end of the Ready Queue.",
                        currentQuery.getCustomerName(), currentQuery.getQueryDescription(), remainingBefore, timeQuantum,
                        currentAgent.getName(), timeSpentInStep, remainingAfter
                );
            }

            // Construct timeline log
            String timelineLog;
            if (isCompleted) {
                timelineLog = String.format(
                        "Time %d-%d: %s's %s -> %s [COMPLETED]",
                        startTime, endTime, currentQuery.getCustomerName(), currentQuery.getQueryDescription(), currentAgent.getName()
                );
            } else {
                timelineLog = String.format(
                        "Time %d-%d: %s's %s -> %s [Remaining: %d]",
                        startTime, endTime, currentQuery.getCustomerName(), currentQuery.getQueryDescription(), currentAgent.getName(), remainingAfter
                );
            }
            timelineEntries.add(timelineLog);

            // Populate step model
            SimulationStep step = new SimulationStep();
            step.setStepNumber(stepNumber++);
            step.setStartTime(startTime);
            step.setEndTime(endTime);
            step.setQueryId(currentQuery.getId());
            step.setCustomerName(currentQuery.getCustomerName());
            step.setQueryDescription(currentQuery.getQueryDescription());
            step.setAgentId(currentAgent.getId());
            step.setAgentName(currentAgent.getName());
            step.setAgentAvatarColor(currentAgent.getAvatarColor());
            step.setQueryColor(currentQuery.getColor());
            step.setTimeSpentInStep(timeSpentInStep);
            step.setRemainingTimeBefore(remainingBefore);
            step.setRemainingTimeAfter(remainingAfter);
            step.setCompleted(isCompleted);
            step.setStatusAfterStep(statusAfterStep);
            step.setReadyQueueBefore(readyQueueBefore);
            step.setReadyQueueAfter(readyQueueAfter);
            step.setAgentStates(agentStatesSnapshot);
            step.setExplanation(explanation);
            step.setTimelineLog(timelineLog);

            steps.add(step);
        }

        // 3. Compute overall simulation metrics
        double totalWaitingTime = 0;
        double totalTurnaroundTime = 0;
        List<CustomerQuery> finalQueryList = new ArrayList<>(queryMetricsMap.values());

        for (CustomerQuery q : finalQueryList) {
            totalWaitingTime += q.getWaitingTime();
            totalTurnaroundTime += q.getTurnaroundTime();
        }

        double avgWaitingTime = finalQueryList.isEmpty() ? 0 : (totalWaitingTime / finalQueryList.size());
        double avgTurnaroundTime = finalQueryList.isEmpty() ? 0 : (totalTurnaroundTime / finalQueryList.size());

        // Round to 2 decimal places
        avgWaitingTime = Math.round(avgWaitingTime * 100.0) / 100.0;
        avgTurnaroundTime = Math.round(avgTurnaroundTime * 100.0) / 100.0;

        // Build result object
        SimulationResult result = new SimulationResult();
        result.setTimeQuantum(timeQuantum);
        result.setTotalSimulationTime(currentTime);
        result.setTotalQueries(finalQueryList.size());
        result.setCompletedQueries(finalQueryList.size());
        result.setTotalTurns(steps.size());
        result.setAverageWaitingTime(avgWaitingTime);
        result.setAverageTurnaroundTime(avgTurnaroundTime);
        result.setSteps(steps);
        result.setQueryDetails(finalQueryList);
        result.setAgentWorkloads(simAgents);
        result.setTimelineEntries(timelineEntries);

        // Synchronize in-memory query & agent data with completed state
        for (CustomerQuery metric : finalQueryList) {
            queries.stream()
                    .filter(q -> q.getId().equals(metric.getId()))
                    .findFirst()
                    .ifPresent(q -> {
                        q.setStatus("COMPLETED");
                        q.setRemainingTime(0);
                        q.setCompletionTime(metric.getCompletionTime());
                        q.setTurnaroundTime(metric.getTurnaroundTime());
                        q.setWaitingTime(metric.getWaitingTime());
                    });
        }

        for (ServiceAgent simAgent : simAgents) {
            agents.stream()
                    .filter(a -> a.getId().equals(simAgent.getId()))
                    .findFirst()
                    .ifPresent(a -> {
                        a.setQueriesHandled(simAgent.getQueriesHandled());
                        a.setTotalTimeSpent(simAgent.getTotalTimeSpent());
                        a.setStatus("AVAILABLE");
                        a.setCurrentCustomer("None (Completed)");
                        a.setCurrentQueryDescription("-");
                    });
        }

        return result;
    }

    private List<CustomerQuery> cloneQueue(Queue<CustomerQuery> queue) {
        List<CustomerQuery> list = new ArrayList<>();
        for (CustomerQuery q : queue) {
            list.add(new CustomerQuery(q));
        }
        return list;
    }
}
