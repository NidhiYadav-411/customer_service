package com.spos.customerservice.model;

/**
 * Model representing a customer service representative (Agent).
 * Keeps track of current workload, queries handled, and availability.
 */
public class ServiceAgent {
    private String id;
    private String name;
    private String status;               // AVAILABLE, BUSY
    private String currentCustomer;      // Name of customer currently handled (or "-" if idle)
    private String currentQueryDescription; // Description of current query
    private int queriesHandled;          // Total query sessions or completed queries handled
    private int totalTimeSpent;          // Total units of time active
    private String avatarColor;          // Visual color identifier for UI

    public ServiceAgent() {
        this.status = "AVAILABLE";
        this.currentCustomer = "None (Idle)";
        this.currentQueryDescription = "-";
        this.queriesHandled = 0;
        this.totalTimeSpent = 0;
    }

    public ServiceAgent(String id, String name, String avatarColor) {
        this.id = id;
        this.name = name;
        this.status = "AVAILABLE";
        this.currentCustomer = "None (Idle)";
        this.currentQueryDescription = "-";
        this.queriesHandled = 0;
        this.totalTimeSpent = 0;
        this.avatarColor = avatarColor;
    }

    // Copy constructor for simulation snapshots
    public ServiceAgent(ServiceAgent other) {
        this.id = other.id;
        this.name = other.name;
        this.status = other.status;
        this.currentCustomer = other.currentCustomer;
        this.currentQueryDescription = other.currentQueryDescription;
        this.queriesHandled = other.queriesHandled;
        this.totalTimeSpent = other.totalTimeSpent;
        this.avatarColor = other.avatarColor;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCurrentCustomer() {
        return currentCustomer;
    }

    public void setCurrentCustomer(String currentCustomer) {
        this.currentCustomer = currentCustomer;
    }

    public String getCurrentQueryDescription() {
        return currentQueryDescription;
    }

    public void setCurrentQueryDescription(String currentQueryDescription) {
        this.currentQueryDescription = currentQueryDescription;
    }

    public int getQueriesHandled() {
        return queriesHandled;
    }

    public void setQueriesHandled(int queriesHandled) {
        this.queriesHandled = queriesHandled;
    }

    public int getTotalTimeSpent() {
        return totalTimeSpent;
    }

    public void setTotalTimeSpent(int totalTimeSpent) {
        this.totalTimeSpent = totalTimeSpent;
    }

    public String getAvatarColor() {
        return avatarColor;
    }

    public void setAvatarColor(String avatarColor) {
        this.avatarColor = avatarColor;
    }
}
