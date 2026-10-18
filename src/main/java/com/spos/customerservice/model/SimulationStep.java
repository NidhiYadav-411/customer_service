package com.spos.customerservice.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single scheduling turn in the Round Robin simulation.
 * Contains complete details about the active query, active agent,
 * time boundaries, remaining processing time, queue snapshots, and plain-English explanation.
 */
public class SimulationStep {
    private int stepNumber;
    private int startTime;
    private int endTime;
    private String queryId;
    private String customerName;
    private String queryDescription;
    private String agentId;
    private String agentName;
    private String agentAvatarColor;
    private String queryColor;
    private int timeSpentInStep;
    private int remainingTimeBefore;
    private int remainingTimeAfter;
    private boolean isCompleted;
    private String statusAfterStep; // COMPLETED or REQUEUED
    private List<CustomerQuery> readyQueueBefore = new ArrayList<>();
    private List<CustomerQuery> readyQueueAfter = new ArrayList<>();
    private List<ServiceAgent> agentStates = new ArrayList<>();
    private String explanation;
    private String timelineLog;

    public SimulationStep() {
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(int stepNumber) {
        this.stepNumber = stepNumber;
    }

    public int getStartTime() {
        return startTime;
    }

    public void setStartTime(int startTime) {
        this.startTime = startTime;
    }

    public int getEndTime() {
        return endTime;
    }

    public void setEndTime(int endTime) {
        this.endTime = endTime;
    }

    public String getQueryId() {
        return queryId;
    }

    public void setQueryId(String queryId) {
        this.queryId = queryId;
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

    public String getAgentId() {
        return agentId;
    }

    public void setAgentId(String agentId) {
        this.agentId = agentId;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public String getAgentAvatarColor() {
        return agentAvatarColor;
    }

    public void setAgentAvatarColor(String agentAvatarColor) {
        this.agentAvatarColor = agentAvatarColor;
    }

    public String getQueryColor() {
        return queryColor;
    }

    public void setQueryColor(String queryColor) {
        this.queryColor = queryColor;
    }

    public int getTimeSpentInStep() {
        return timeSpentInStep;
    }

    public void setTimeSpentInStep(int timeSpentInStep) {
        this.timeSpentInStep = timeSpentInStep;
    }

    public int getRemainingTimeBefore() {
        return remainingTimeBefore;
    }

    public void setRemainingTimeBefore(int remainingTimeBefore) {
        this.remainingTimeBefore = remainingTimeBefore;
    }

    public int getRemainingTimeAfter() {
        return remainingTimeAfter;
    }

    public void setRemainingTimeAfter(int remainingTimeAfter) {
        this.remainingTimeAfter = remainingTimeAfter;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }

    public String getStatusAfterStep() {
        return statusAfterStep;
    }

    public void setStatusAfterStep(String statusAfterStep) {
        this.statusAfterStep = statusAfterStep;
    }

    public List<CustomerQuery> getReadyQueueBefore() {
        return readyQueueBefore;
    }

    public void setReadyQueueBefore(List<CustomerQuery> readyQueueBefore) {
        this.readyQueueBefore = readyQueueBefore;
    }

    public List<CustomerQuery> getReadyQueueAfter() {
        return readyQueueAfter;
    }

    public void setReadyQueueAfter(List<CustomerQuery> readyQueueAfter) {
        this.readyQueueAfter = readyQueueAfter;
    }

    public List<ServiceAgent> getAgentStates() {
        return agentStates;
    }

    public void setAgentStates(List<ServiceAgent> agentStates) {
        this.agentStates = agentStates;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getTimelineLog() {
        return timelineLog;
    }

    public void setTimelineLog(String timelineLog) {
        this.timelineLog = timelineLog;
    }
}
