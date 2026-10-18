package com.spos.customerservice.model;

/**
 * Model representing a customer query in the customer service center.
 * Stores query details, burst time, remaining time, and scheduling metrics.
 */
public class CustomerQuery {
    private String id;
    private String customerName;
    private String queryDescription;
    private int estimatedTime; // Burst Time (original processing time required)
    private int remainingTime; // Remaining processing time
    private String status;     // PENDING, IN_PROGRESS, COMPLETED
    private String assignedAgent;
    private int arrivalTime;   // Arrival time into the system
    private int completionTime; // Time when processing finished
    private int turnaroundTime; // Turnaround Time = Completion Time - Arrival Time
    private int waitingTime;    // Waiting Time = Turnaround Time - Estimated Time
    private String color;       // Theme color for visual distinction

    public CustomerQuery() {
        this.status = "PENDING";
        this.arrivalTime = 0;
    }

    public CustomerQuery(String id, String customerName, String queryDescription, int estimatedTime, String assignedAgent) {
        this.id = id;
        this.customerName = customerName;
        this.queryDescription = queryDescription;
        this.estimatedTime = estimatedTime;
        this.remainingTime = estimatedTime;
        this.status = "PENDING";
        this.assignedAgent = (assignedAgent == null || assignedAgent.trim().isEmpty()) ? "Auto" : assignedAgent;
        this.arrivalTime = 0;
    }

    // Copy constructor to prevent mutability leaks during simulation snapshots
    public CustomerQuery(CustomerQuery other) {
        this.id = other.id;
        this.customerName = other.customerName;
        this.queryDescription = other.queryDescription;
        this.estimatedTime = other.estimatedTime;
        this.remainingTime = other.remainingTime;
        this.status = other.status;
        this.assignedAgent = other.assignedAgent;
        this.arrivalTime = other.arrivalTime;
        this.completionTime = other.completionTime;
        this.turnaroundTime = other.turnaroundTime;
        this.waitingTime = other.waitingTime;
        this.color = other.color;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getQueryDescription() {
        return queryDescription;
    }

    public void setQueryDescription(String queryDescription) {
        this.queryDescription = queryDescription;
    }

    public int getEstimatedTime() {
        return estimatedTime;
    }

    public void setEstimatedTime(int estimatedTime) {
        this.estimatedTime = estimatedTime;
        if (this.remainingTime == 0) {
            this.remainingTime = estimatedTime;
        }
    }

    public int getRemainingTime() {
        return remainingTime;
    }

    public void setRemainingTime(int remainingTime) {
        this.remainingTime = remainingTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedAgent() {
        return assignedAgent;
    }

    public void setAssignedAgent(String assignedAgent) {
        this.assignedAgent = assignedAgent;
    }

    public int getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(int arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public int getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(int completionTime) {
        this.completionTime = completionTime;
    }

    public int getTurnaroundTime() {
        return turnaroundTime;
    }

    public void setTurnaroundTime(int turnaroundTime) {
        this.turnaroundTime = turnaroundTime;
    }

    public int getWaitingTime() {
        return waitingTime;
    }

    public void setWaitingTime(int waitingTime) {
        this.waitingTime = waitingTime;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
