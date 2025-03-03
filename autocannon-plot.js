const autocannon = require('autocannon');
const { plot } = require('nodeplotlib');

// Function to run a benchmark against a given URL
async function runBenchmark(url, connections = 10, duration = 20) {
  console.log(`Running benchmark for: ${url}`);
  return new Promise((resolve, reject) => {
    const instance = autocannon({ url, connections, duration }, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
    // Display a progress bar in the console
    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  // Define test configurations for Node.js and Bun endpoints
  const tests = [
    { name: 'Node.js CRUD', url: 'http://localhost:4000/items' },
    { name: 'Bun CRUD', url: 'http://localhost:4001/items' },
  ];

  const results = [];

  // Run benchmarks sequentially and store results
  for (const test of tests) {
    console.log(`\nTesting ${test.name}...`);
    try {
      const result = await runBenchmark(test.url, 10, 20);
      results.push({
        name: test.name,
        // Capture average requests per second and average latency (ms)
        rps: result.requests.average,
        latency: result.latency.average,
      });
      console.log(`${test.name} - RPS: ${result.requests.average.toFixed(2)}, Latency: ${result.latency.average.toFixed(2)}ms`);
    } catch (error) {
      console.error(`Error testing ${test.name}:`, error);
    }
  }

  // Prepare data for plotting RPS
  const rpsData = [{
    x: results.map(r => r.name),
    y: results.map(r => r.rps),
    type: 'bar',
    name: 'Requests per Second'
  }];

  // Prepare data for plotting Latency
  const latencyData = [{
    x: results.map(r => r.name),
    y: results.map(r => r.latency),
    type: 'bar',
    name: 'Latency (ms)'
  }];

  // Plot the Requests per Second comparison
  plot(rpsData, {
    title: 'Requests per Second Comparison',
    xaxis: { title: 'Server' },
    yaxis: { title: 'RPS' }
  });

  // Plot the Latency comparison
  plot(latencyData, {
    title: 'Latency Comparison (ms)',
    xaxis: { title: 'Server' },
    yaxis: { title: 'Latency (ms)' }
  });
}

main();
