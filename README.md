🌪️ Chaos Engineering Devops Project
The standout feature of this project is its resilience testing. We didn't just build a site; we tried to break it. Using Steadybit, we orchestrated controlled "attacks" to identify single points of failure.

Experiments Performed:
CPU Exhaustion: We simulated massive traffic spikes by forcing the host CPU to 100%. This allowed us to measure Time to First Byte (TTFB) degradation and identify the need for horizontal scaling.

Process Termination: We performed a "Stop Process" attack on our Node.js backend. This experiment proved that a single-instance setup is a Single Point of Failure, leading us to design a failover strategy using Load Balancers.

📊 Performance Insights
Through our chaos experiments, we discovered:

Latency Correlation: CPU stress above 80% leads to a exponential increase in TTFB, identifying a clear threshold for our AWS Auto-Scaling triggers.

Process Resilience: Sudden process termination requires an automated orchestrator (like PM2 or Kubernetes) to maintain 99.9% uptime.

📖 How to Run Locally
Clone the repo: git clone https://github.com/yourusername/sensus-perfumes.git

Install Dependencies: npm install (in both root and client folders).

Setup Environment: Create a .env file for your MongoDB URI and Port settings.

Start the Engine: npm run dev
