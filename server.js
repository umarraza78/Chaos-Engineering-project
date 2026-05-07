const express = require('express');
const path = require('path');
const os = require('os');
const app = express();
const PORT = 3000;

const CPU_MONITOR_INTERVAL_MS = 500;
const CPU_OVERLOAD_THRESHOLD = 0.30;
let crashOnOverload = process.env.CHAOS_CRASH_ON_CPU !== 'false';
let lastCpuUsage = process.cpuUsage();
let lastMonitorTime = process.hrtime.bigint();
let currentCpuLoad = 0;
let isFirstRun = true;

function updateCpuLoad() {
    const now = process.hrtime.bigint();
    const elapsedNs = now - lastMonitorTime;
    const deltaUsage = process.cpuUsage(lastCpuUsage);
    lastCpuUsage = process.cpuUsage();
    lastMonitorTime = now;

    if (!isFirstRun) {
        const totalCpuMicros = deltaUsage.user + deltaUsage.system;
        const elapsedMs = Number(elapsedNs) / 1000000;
        
        if (elapsedMs > 0) {
            currentCpuLoad = Math.min(1, totalCpuMicros / (elapsedMs * 1000));
        }

        console.log(`[CPU Monitor] Load: ${(currentCpuLoad * 100).toFixed(2)}% | Threshold: ${(CPU_OVERLOAD_THRESHOLD * 100).toFixed(0)}% | Crash: ${crashOnOverload}`);

        if (crashOnOverload && currentCpuLoad > CPU_OVERLOAD_THRESHOLD) {
            console.error(`\n!!! CPU OVERLOAD DETECTED: ${(currentCpuLoad * 100).toFixed(2)}% !!! CRASHING for chaos demo.\n`);
            process.exit(1);
        }
    } else {
        isFirstRun = false;
    }
}

setInterval(updateCpuLoad, CPU_MONITOR_INTERVAL_MS);
updateCpuLoad();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
    const status = currentCpuLoad > CPU_OVERLOAD_THRESHOLD ? 'Degraded' : 'Healthy';
    res.status(200).json({ 
        status,
        cpuLoad: Number(currentCpuLoad.toFixed(3)),
        crashOnOverload,
        pid: process.pid,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/chaos-mode', (req, res) => {
    if (typeof req.body.crashOnOverload === 'boolean') {
        crashOnOverload = req.body.crashOnOverload;
        return res.status(200).json({ crashOnOverload });
    }

    res.status(400).json({ error: 'Send { crashOnOverload: true|false } in the request body.' });
});

app.post('/api/stress', (req, res) => {
    const durationMs = Math.min(Number(req.body.durationMs) || 5000, 15000);
    const end = Date.now() + durationMs;

    while (Date.now() < end) {
        Math.sqrt(Math.random() * Math.random());
    }

    res.status(200).json({ status: 'stress-complete', durationMs, pid: process.pid, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`E-commerce API running on port ${PORT}`);
    console.log(`Process ID: ${process.pid}`);
    console.log(`CPU Overload Threshold: ${(CPU_OVERLOAD_THRESHOLD * 100).toFixed(0)}%`);
    console.log(`CPU Crash Mode: ${crashOnOverload ? '✓ ENABLED' : '✗ DISABLED'}`);
    console.log(`========================================\n`);
});