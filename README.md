# Bun vs Node.js Performance Comparison

## Purpose

This project aims to provide a comprehensive performance comparison between Bun and Node.js when running a simple CRUD API application. By benchmarking both environments, we seek to understand their efficiency, resource utilization, and scalability under identical conditions.

With the increasing adoption of Bun as a potential alternative to Node.js, it's crucial to evaluate its real-world performance for API-driven applications. The findings from this project can help developers and organizations make informed decisions about whether to adopt Bun in production environments.

## Overview

This repository contains:

- A Node.js implementation of a CRUD API
- A Bun implementation of the same CRUD API
- Performance benchmarking tools utilizing Autocannon
- Graphical visualization of benchmark results for easy analysis

By running structured performance tests, we can compare key performance metrics such as request throughput and latency. This will help assess how Bun stacks up against Node.js in handling concurrent API requests.

## Why This Matters

The performance of backend frameworks directly impacts application scalability, response times, and resource consumption. By benchmarking Bun against Node.js, we can:

- Identify potential speed and efficiency gains
- Determine which runtime offers better throughput under heavy load
- Evaluate response latency and resource utilization
- Provide data-driven insights for developers considering Bun for production workloads

## Prerequisites

To run this project, ensure you have the following installed:

- Node.js (v22.12.0 or later)
  ```bash
  # Install Node.js using nvm (recommended)
  # First install nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
  # or with wget
  wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
  
  # Reload shell configuration
  source ~/.bashrc  # or ~/.zshrc
  
  # Install and use Node.js v22.12.0
  nvm install 22.12.0
  nvm use 22.12.0
  
  # Alternatively, download the installer from:
  # https://nodejs.org/dist/v22.12.0/
  ```
  
- Bun (latest version)
  ```bash
  # Install Bun
  curl -fsSL https://bun.sh/install | bash
  ```
  
- npm, yarn, or Bun as a package manager

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd bun-vs-node
   ```

2. Install dependencies:
   ```bash
   # Using npm
   npm install
   
   # Or using yarn
   yarn
   
   # Or using bun
   bun install
   ```

## Running the APIs

### Node.js CRUD API

```bash
node node-crud.js
```

The Node.js API will be available at http://localhost:4000

### Bun CRUD API

```bash
bun bun-crud.js
```

The Bun API will be available at http://localhost:4001

## API Endpoints

Both implementations expose identical RESTful endpoints:

- `GET /items` - Retrieve all items
- `GET /items/:id` - Retrieve a single item by ID
- `POST /items` - Create a new item
- `PUT /items/:id` - Update an existing item
- `DELETE /items/:id` - Delete an item

## Running the Benchmarks

Once both APIs are running, execute the benchmarking script:

```bash
node autocannon-plot.js
```

This script will:
1. Simulate API traffic using Autocannon
2. Generate performance comparison graphs displaying:
   - Requests per second (RPS)
   - Average response latency

## Interpreting the Results

The benchmarks are conducted with the following parameters:

- 10 concurrent connections
- 20-second duration tests

Key Metrics:
- Higher RPS (Requests Per Second) → Indicates better API throughput
- Lower latency → Suggests faster response times and improved efficiency

By analyzing these results, we can determine which runtime offers superior performance under stress.

## Database

Both implementations use SQLite via better-sqlite3. The database file (database.db) is created automatically when the API is first run. This ensures a consistent data storage backend for the comparison.

## Future Improvements & Further Experimentation

We encourage contributions and feedback to extend this study. Here are some areas for further exploration:

- Test with different database systems (e.g., PostgreSQL, MongoDB, MySQL)
- Evaluate memory and CPU consumption for each runtime
- Benchmark under varying workloads (e.g., 100+ concurrent users, long-lived connections)
- Analyze performance with real-world middleware (authentication, logging, caching)

If you have insights or alternative testing methods, please contribute your findings!

## Contributing

Welcome all contributions!

## Authors & Acknowledgment

Dr. Abdul Hamid - Project Owner - [LinkedIn](https://www.linkedin.com/in/ahceo/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
