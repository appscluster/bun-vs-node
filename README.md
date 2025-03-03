# Bun vs Node.js Performance Comparison

This project compares the performance of Bun and Node.js when running a simple CRUD API application.

## Overview

This repository contains:
- A Node.js CRUD API implementation
- A Bun CRUD API implementation (similar to the Node.js version)
- Performance benchmarking tools using Autocannon
- Visualization of the benchmark results

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Bun](https://bun.sh/) (latest version)
- npm or yarn

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

The Node.js API will be available at http://localhost:3000

### Bun CRUD API

```bash
bun bun-crud.js
```

The Bun API will be available at http://localhost:3001

## API Endpoints

Both APIs expose the same endpoints:

- `GET /items` - Retrieve all items
- `GET /items/:id` - Retrieve a single item by ID
- `POST /items` - Create a new item
- `PUT /items/:id` - Update an existing item
- `DELETE /items/:id` - Delete an item

## Running the Benchmarks

Ensure both APIs are running, then execute the benchmark script:

```bash
node autocannon-plot.js
```

This will:
1. Run performance tests against both the Node.js and Bun APIs
2. Generate comparison graphs for:
   - Requests per second
   - Average latency

## Understanding the Results

The benchmarks test each API with:
- 10 concurrent connections
- 20-second duration tests

The results visualize:
- **Higher RPS (requests per second)** indicates better throughput
- **Lower latency** indicates better response time

## Database

Both implementations use SQLite via better-sqlite3. The database file `database.db` is created automatically when you run either API for the first time.

## Notes

- For production use, you may want to configure more robust error handling and validation
- The benchmark results may vary based on your hardware and system load
