// autocannon-plot.js
const autocannon = require('autocannon');
const { plot } = require('nodeplotlib');

// List of endpoints to test
// Each test includes: label, method, Node.js URL, Bun URL, (optionally) body and headers.
const endpoints = [
  {
    label: "GET /items",
    method: "GET",
    nodeUrl: "http://localhost:4000/items",
    bunUrl: "http://localhost:4001/items"
  },
  {
    label: "GET /items/search",
    method: "GET",
    nodeUrl: "http://localhost:4000/items/search?term=test",
    bunUrl: "http://localhost:4001/items/search?term=test"
  },
  {
    label: "POST /items/bulk",
    method: "POST",
    nodeUrl: "http://localhost:4000/items/bulk",
    bunUrl: "http://localhost:4001/items/bulk",
    body: JSON.stringify([
      { name: "Bulk 1", description: "Desc" },
      { name: "Bulk 2", description: "Desc" },
      { name: "Bulk 3", description: "Desc" }
    ]),
    headers: { "Content-Type": "application/json" }
  },
  {
    label: "GET /items/complex",
    method: "GET",
    nodeUrl: "http://localhost:4000/items/complex",
    bunUrl: "http://localhost:4001/items/complex"
  }
];

// Function to run a benchmark test with autocannon
async function runBenchmark({ url, method, body, headers }, connections = 10, duration = 20) {
  console.log(`Running benchmark for: ${url} [${method}]`);
  return new Promise((resolve, reject) => {
    const instance = autocannon({
      url,
      method,
      body,
      headers,
      connections,
      duration
    }, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  // Data structure to hold results
  // Format: { endpoint, server: "Node.js" | "Bun", rps, latency }
  const results = [];

  // For each endpoint type, run tests against Node.js and Bun servers.
  for (const ep of endpoints) {
    console.log(`\nTesting ${ep.label} on Node.js...`);
    try {
      const resNode = await runBenchmark({
        url: ep.nodeUrl,
        method: ep.method,
        body: ep.body,
        headers: ep.headers
      });
      results.push({
        endpoint: ep.label,
        server: "Node.js",
        rps: resNode.requests.average,
        latency: resNode.latency.average
      });
      console.log(`Node.js ${ep.label} - RPS: ${resNode.requests.average.toFixed(2)}, Latency: ${resNode.latency.average.toFixed(2)}ms`);
    } catch (error) {
      console.error(`Error testing Node.js ${ep.label}:`, error);
    }

    console.log(`\nTesting ${ep.label} on Bun...`);
    try {
      const resBun = await runBenchmark({
        url: ep.bunUrl,
        method: ep.method,
        body: ep.body,
        headers: ep.headers
      });
      results.push({
        endpoint: ep.label,
        server: "Bun",
        rps: resBun.requests.average,
        latency: resBun.latency.average
      });
      console.log(`Bun ${ep.label} - RPS: ${resBun.requests.average.toFixed(2)}, Latency: ${resBun.latency.average.toFixed(2)}ms`);
    } catch (error) {
      console.error(`Error testing Bun ${ep.label}:`, error);
    }
  }

  // Prepare data for grouped bar charts:
  // For each endpoint, we have two bars: one for Node.js and one for Bun.
  const endpointsLabels = endpoints.map(ep => ep.label);
  const nodeRps = endpoints.map(ep => {
    const found = results.find(r => r.endpoint === ep.label && r.server === "Node.js");
    return found ? found.rps : 0;
  });
  const bunRps = endpoints.map(ep => {
    const found = results.find(r => r.endpoint === ep.label && r.server === "Bun");
    return found ? found.rps : 0;
  });

  const nodeLatency = endpoints.map(ep => {
    const found = results.find(r => r.endpoint === ep.label && r.server === "Node.js");
    return found ? found.latency : 0;
  });
  const bunLatency = endpoints.map(ep => {
    const found = results.find(r => r.endpoint === ep.label && r.server === "Bun");
    return found ? found.latency : 0;
  });

  // Plot RPS comparison
  const rpsData = [
    {
      x: endpointsLabels,
      y: nodeRps,
      type: 'bar',
      name: 'Node.js'
    },
    {
      x: endpointsLabels,
      y: bunRps,
      type: 'bar',
      name: 'Bun'
    }
  ];
  plot(rpsData, {
    title: 'Requests per Second Comparison',
    xaxis: { title: 'Endpoint' },
    yaxis: { title: 'RPS' }
  });

  // Plot Latency comparison
  const latencyData = [
    {
      x: endpointsLabels,
      y: nodeLatency,
      type: 'bar',
      name: 'Node.js'
    },
    {
      x: endpointsLabels,
      y: bunLatency,
      type: 'bar',
      name: 'Bun'
    }
  ];
  plot(latencyData, {
    title: 'Latency Comparison (ms)',
    xaxis: { title: 'Endpoint' },
    yaxis: { title: 'Latency (ms)' }
  });
}

main();
