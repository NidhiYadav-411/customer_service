package com.spos.customerservice.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Stores the final result and detailed metrics of the Round Robin simulation.
 */
public class SimulationResult {
    private int timeQuantum;
    private int totalSimulationTime;
    private int totalQueries;
    private int completedQueries;
    private int totalTurns;
    private double averageWaitingTime;
    private double averageTurnaroundTime;
    private List<SimulationStep> steps = new ArrayList<>();
    private List<CustomerQuery> queryDetails = new ArrayList<>();
    private List<ServiceAgent> agentWorkloads = new ArrayList<>();
    private List<String> timelineEntries = new ArrayList<>();

    public SimulationResult() {
    }

    public int getTimeQuantum() {
        return timeQuantum;
    }

    public void setTimeQuantum(int timeQuantum) {
        this.timeQuantum = timeQuantum;
    }

    public int getTotalSimulationTime() {
        return totalSimulationTime;
    }

    public void setTotalSimulationTime(int totalSimulationTime) {
        this.totalSimulationTime = totalSimulationTime;
    }

    public int getTotalQueries() {
        return totalQueries;
    }

    public void setTotalQueries(int totalQueries) {
        this.totalQueries = totalQueries;
    }

    public int getCompletedQueries() {
        return completedQueries;
    }

    public void setCompletedQueries(int completedQueries) {
        this.completedQueries = completedQueries;
    }

    public int getTotalTurns() {
        return totalTurns;
    }

    public void setTotalTurns(int totalTurns) {
        this.totalTurns = totalTurns;
    }

    public double getAverageWaitingTime() {
        return averageWaitingTime;
    }

    public void setAverageWaitingTime(double averageWaitingTime) {
        this.averageWaitingTime = averageWaitingTime;
    }

    public double getAverageTurnaroundTime() {
        return averageTurnaroundTime;
    }

    public void setAverageTurnaroundTime(double averageTurnaroundTime) {
        this.averageTurnaroundTime = averageTurnaroundTime;
    }

    public List<SimulationStep> getSteps() {
        return steps;
    }

    public void setSteps(List<SimulationStep> steps) {
        this.steps = steps;
    }

    public List<CustomerQuery> getQueryDetails() {
        return queryDetails;
    }

    public void setQueryDetails(List<CustomerQuery> queryDetails) {
        this.queryDetails = queryDetails;
    }

    public List<ServiceAgent> getAgentWorkloads() {
        return agentWorkloads;
    }

    public void setAgentWorkloads(List<ServiceAgent> agentWorkloads) {
        this.agentWorkloads = agentWorkloads;
    }

    public List<String> getTimelineEntries() {
        return timelineEntries;
    }

    public void setTimelineEntries(List<String> timelineEntries) {
        this.timelineEntries = timelineEntries;
    }
}
