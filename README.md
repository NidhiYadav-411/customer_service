# Customer Service Center — Round Robin Scheduling System

A complete, modern, interactive, and beginner-friendly web application for college operating systems practicals and viva examinations. The system simulates a real-world **Customer Service Call/Ticket Center** by distributing incoming customer queries among available service representatives using the classic **Round Robin (RR) Scheduling Algorithm**.

---

## 🌟 Key Features

1. **Pure Java Backend**:
   - Built with **Java (JDK 17+) and Spring Boot 3.3.x**.
   - The entire Round Robin algorithm logic, queue state management, agent turn alternation, and metric calculations run strictly inside the Java backend (`SchedulingService.java`).
   - Uses standard Java collections: `LinkedList` (Queue) and `ArrayList`. **No external database required** (in-memory storage).

2. **Clean, Modern Frontend**:
   - Modern, professional blue-and-white theme built with **Bootstrap 5**, custom CSS, and Vanilla JavaScript.
   - **Zero complex build steps**: No React, Node.js, or npm needed. Served directly via Spring Boot.

3. **4 Fully Working Pages**:
   - **Page 1: Home Dashboard (`index.html`)**: Real-time KPI statistics (Total Queries, Pending, Completed, Available Agents, Time Quantum), query overview table, and an interactive Viva Guide.
   - **Page 2: Manage Customer Queries (`queries.html`)**: Add, filter, search, and delete customer tickets with input validation and feedback.
   - **Page 3: Manage Service Agents (`agents.html`)**: Register service representatives, view current call assignments, turns handled, and workload distribution with duplicate-name prevention.
   - **Page 4: Round Robin Process Visualization (`visualize.html`) — Core Highlight**:
     - Interactive controls: Configurable Time Quantum, Start, Pause, Resume, Reset, Next Step (step-by-step mode), and Simulation Speed slider.
     - **Ready Queue Track**: FIFO horizontal queue with animated cards for Waiting and In-Service queries.
     - **Service Agent Visualizer**: Shows active vs idle agents, current customer assigned, slice progress bars, and total busy time.
     - **Process Explanation Panel**: Displays plain-English viva explanations dynamically at every scheduling turn.
     - **Execution Timeline Log**: Chronological interval log (e.g. `Time 0–2: Rahul Sharma's Payment Gateway Timeout -> Agent Alex`).
     - **Scheduling Gantt Timeline**: Proportional colored time blocks for each turn.
     - **Performance Summary & Viva Metrics**: Calculates Total Simulation Time, Scheduling Turns, Average Waiting Time (AWT), Average Turnaround Time (ATAT), detailed query metrics table, and agent workload distribution.

---

## 📋 Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17+, Spring Boot 3.3.4 (Spring Web) |
| **Data Storage** | Java In-Memory Collections (`ArrayList`, `Queue` / `LinkedList`) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+), Bootstrap 5.3, Bootstrap Icons |
| **API Architecture** | RESTful JSON APIs |
| **Build Tool** | Apache Maven 3.8+ |

---

## 🏗️ Project Architecture & Folder Structure

```text
spos/
├── pom.xml                                      # Maven project configuration
├── README.md                                    # Project documentation & viva guide
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── spos/
        │           └── customerservice/
        │               ├── CustomerServiceApplication.java   # Main Spring Boot launcher
        │               ├── controller/
        │               │   ├── QueryController.java          # REST API for queries (/api/queries)
        │               │   ├── AgentController.java          # REST API for agents (/api/agents)
        │               │   └── SimulationController.java     # REST API for simulation (/api/simulation)
        │               ├── model/
        │               │   ├── CustomerQuery.java            # Query model (Burst Time, CT, TAT, WT)
        │               │   ├── ServiceAgent.java             # Agent model (Workload, Status)
        │               │   ├── SimulationStep.java           # Details for a single scheduling turn
        │               │   └── SimulationResult.java         # Overall simulation results & metrics
        │               └── service/
        │                   └── SchedulingService.java        # Core Round Robin Algorithm in Java
        └── resources/
            ├── application.properties               # Server port & static resource configuration
            └── static/
                ├── css/
                │   └── style.css                    # Professional styling & animations
                ├── js/
                │   ├── dashboard.js                 # Dashboard stats & quick actions
                │   ├── queries.js                   # Query form & table management
                │   ├── agents.js                    # Agent registration & workload
                │   └── simulation.js                # Visualization engine & Gantt chart
                ├── index.html                       # Page 1: Dashboard
                ├── queries.html                     # Page 2: Manage Queries
                ├── agents.html                      # Page 3: Manage Agents
                └── visualize.html                   # Page 4: Round Robin Visualization
```

---

## 🚀 How to Run the Project Locally

### Prerequisites
1. **Java JDK 17 or higher** (JDK 17, 21, or 23 installed).
   Verify by running:
   ```bash
   java -version
   ```
2. **Apache Maven 3.8 or higher**.
   Verify by running:
   ```bash
   mvn -version
   ```

### Step 1: Open Terminal / Command Prompt
Navigate to the project root directory:
```bash
cd c:\Users\hp5cd\OneDrive\Desktop\spos
```

### Step 2: Build and Run the Application
You can run the project using Maven with one command:
```bash
mvn spring-boot:run
```

*(Alternatively, you can package the executable JAR and run it directly:)*
```bash
mvn clean package -DskipTests
java -jar target/customer-service-scheduler-1.0.0.jar
```

### Step 3: Access the Website in Your Browser
Once the console displays `Local Application started successfully!`, open your browser at:
```text
http://localhost:8080
```

---

## 🧪 Sample Pre-Seeded Data

The application automatically initializes with 3 agents and 5 realistic customer service tickets so you can test and present immediately without manual typing:

### Pre-Seeded Service Representatives
- **Agent Alex** (A1)
- **Agent Sarah** (A2)
- **Agent David** (A3)

### Pre-Seeded Customer Queries
| ID | Customer Name | Query Description | Burst Time (Units) |
|---|---|---|---|
| **Q1** | Rahul Sharma | Payment Gateway Timeout | 5 |
| **Q2** | Priya Patel | Package Delivery Delay | 3 |
| **Q3** | Amit Kumar | Account Password Reset | 2 |
| **Q4** | Sneha Rao | Billing Invoice Dispute | 6 |
| **Q5** | Vikram Singh | Refund Status Inquiry | 4 |

> You can add new queries, delete unstarted queries, add new agents, or click **"Reset Sample Data"** on the dashboard anytime to restore this default set.

---

## 🧠 Round Robin (RR) Algorithm Explanation for Viva

### 1. What is Round Robin Scheduling?
Round Robin is a **preemptive CPU/service scheduling algorithm** designed specifically for time-sharing systems. It allocates a fixed slice of processing time called the **Time Quantum ($q$)** to each process in cyclic order.

### 2. How it Applies to this Customer Service Center
1. **Ready Queue**: Incoming customer queries wait in a **First-In, First-Out (FIFO)** Queue.
2. **Cyclic Agent Dispatch**: The front query in the queue is popped and assigned to the next available representative in round-robin order ($A_1 \to A_2 \to A_3 \to A_1$).
3. **Execution**: The agent services the customer for $\min(\text{Time Quantum}, \text{Remaining Processing Time})$.
4. **Completion or Preemption**:
   - **If remaining time reaches 0**: The query is marked **Completed**, and its Completion Time ($CT$) is recorded.
   - **If processing time remains**: The query is preempted and reinserted at the **tail of the Ready Queue** to await its next turn.
5. **No Starvation**: Because each query receives an equal maximum slice, no single long query can monopolize a representative.

### 3. Viva Formulas & Metric Definitions

- **Arrival Time ($AT$)**: The time tick when the query arrived in the Ready Queue.
- **Burst Time ($BT$)**: The total estimated processing units required to completely resolve the query.
- **Completion Time ($CT$)**: The simulation timestamp when the query finishes processing ($Remaining = 0$).
- **Turnaround Time ($TAT$)**: Total elapsed time from arrival to completion.
  $$\text{Turnaround Time (TAT)} = CT - AT$$
- **Waiting Time ($WT$)**: Total time the customer query spent waiting in the queue without being actively served.
  $$\text{Waiting Time (WT)} = TAT - BT$$
- **Average Waiting Time (AWT)**:
  $$\text{AWT} = \frac{\sum WT}{\text{Total Queries}}$$
- **Average Turnaround Time (ATAT)**:
  $$\text{ATAT} = \frac{\sum TAT}{\text{Total Queries}}$$

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/simulation/status` | Returns total queries, pending count, completed count, and available agents |
| `POST` | `/api/simulation/run?quantum=2` | Executes the Java Round Robin scheduling algorithm and returns the full step-by-step trace and metrics |
| `POST` | `/api/simulation/reset` | Resets all queries back to `PENDING` state |
| `POST` | `/api/simulation/reset-defaults`| Restores original sample demo queries and agents |
| `GET` | `/api/queries` | Returns list of all customer queries |
| `POST` | `/api/queries` | Adds a new customer query (`customerName`, `queryDescription`, `estimatedTime`) |
| `DELETE`| `/api/queries/{id}` | Deletes a customer query |
| `GET` | `/api/agents` | Returns list of all service agents |
| `POST` | `/api/agents` | Registers a new agent (`name`) with duplicate validation |
| `DELETE`| `/api/agents/{id}` | Removes a service agent (ensuring at least 1 agent remains) |

---

## 🎓 College Viva Presentation Checklist

When demonstrating this project to the examiner:
1. Show the **Home Dashboard** (`http://localhost:8080`) and point out the live status cards and the pre-seeded queries.
2. Navigate to **Customer Queries** (`queries.html`) and demonstrate adding a new ticket (e.g. `Deepak Joshi`, `ATM Error`, `3 units`).
3. Navigate to **Service Agents** (`agents.html`) and demonstrate adding a new representative. Show how duplicate agent names are caught and prevented.
4. Open the **Visualize Round Robin Process** (`visualize.html`) page:
   - Highlight the **Ready Queue (FIFO track)**.
   - Point out the **Time Quantum** (default 2).
   - Press **"Start Simulation"** and explain the live steps:
     - The front card moves into active service.
     - The active representative card highlights with a progress bar.
     - The **Step Explanation Panel** explains in plain English why the query was completed or requeued.
     - The **Execution Timeline Log** and **Gantt Chart** record every slice interval.
   - When finished, scroll down to the **Performance Summary & Viva Metrics** section:
     - Show the calculated **Turnaround Time ($TAT$)** and **Waiting Time ($WT$)**.
     - Verify with the examiner that $WT = TAT - BT$.
     - Review the **Agent Workload Breakdown** to show how fairly the load was shared.
