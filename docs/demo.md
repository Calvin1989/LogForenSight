# Local Demo Guide

Follow these steps to demonstrate the **AI Log Security Analyzer** on your local machine.

## Prerequisites
- Python 3.11+
- Node.js 18+

## Step 1: Start the Backend (FastAPI)
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be available at [http://localhost:8000](http://localhost:8000). You can view the API documentation at [/docs](http://localhost:8000/docs).

## Step 2: Start the Frontend (Vue 3)
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at [http://localhost:5173](http://localhost:5173).

## Alternative: Using Docker Compose
If you prefer Docker, you can start both the backend and frontend with a single command:

1. In the project root directory, run:
   ```bash
   docker compose up --build
   ```
2. Once the containers are running, access the application at [http://localhost:5173](http://localhost:5173).
3. To stop the services, run `docker compose down`.

## Step 3: Perform Analysis
1. Open your browser and go to [http://localhost:5173](http://localhost:5173).
2. **Check Active Rules**: Before uploading, look at the **"Active Rule Configuration"** section. It shows the current thresholds and sensitive patterns being used for detection.
3. Click the **"Choose a .log or .txt file"** button.
3. Select the provided sample file: `samples/nginx_access_sample.log` or `samples/apache_access_sample.log`.
    *   **Note**: `samples/nginx_access_sample.log` deliberately contains one malformed line to demonstrate how the tool handles and reports skipped lines.
4. (Optional) Select the **Log Format** (Auto Detect works for both).
5. Click the **"Analyze"** button.

## Step 4: Explore Results
- **Overview Statistics**: View total requests, unique IPs, and error counts.
- **Parsing Quality**: Check the **"Parsing Quality"** card to see the success rate of the log parser. If some lines are skipped, it might indicate an incompatible log format. You can see **Skipped Line Samples** (up to 5) with their original line numbers and content to help you troubleshoot the log format or identify corrupt log entries.
- **Traffic Analysis**: Check Top 5 IPs and Paths.
- **Security Findings**: Review identified risks like "Sensitive Path Probing" or "Suspicious User Agent". Each card shows a description, recommendation, and evidence.
- **Markdown Report**: Scroll to the bottom to see the full Markdown report.
- **Download**: Click **"Download Report (.md)"** to save the analysis locally as5. Click the **"Analyze"** button.

## Step 5: Recent Analyses
The tool automatically remembers your recent work:
1. After performing an analysis, notice the **"Recent Analyses"** section above the statistics.
2. It shows the file name, time, and key metrics (parse rate, incidents, etc.).
3. Refresh the page or close your browser.
4. Open the tool again—the history is still there (stored in your browser's `localStorage`).
5. Click on a history item to instantly restore the analysis results without re-uploading the file.
6. Click **"Clear History"** to remove all local records.

## Step 6: Filter and Search
When dealing with many findings, use the built-in filters:
1.  Scroll to **"Aggregated Security Incidents"**.
2.  Use the **Severity** dropdown to show only "HIGH" risks.
3.  Type an IP address in the **Source IP** box to focus on a specific attacker.
4.  Scroll to **"Security Findings"**.
5. Try the **Search** box to find specific keywords (e.g., "sqlmap" or ".env").
6. Filter by **Rule** to see all instances of a specific detection rule.
7. Click **"Copy Filtered JSON"** to quickly export the current view to your clipboard for use in other tools.
8. Look for an incident or finding with many evidence samples. Click **"Show all evidence"** to expand the full list and **"Show less"** to collapse it back.
9. Click **"Clear"** or **"Clear Filters"** to reset.

## Step 7: Safe Sharing with Sanitization
One of the key features of the analyzer is the ability to share results without leaking sensitive data.
1. In the Markdown Report section, look for the **"Download Sanitized (.md)"** button.
2. Click it to generate a redacted version of the report.
3. **What's the difference?**
   - **Raw Report**: Contains full IP addresses (e.g., `192.168.1.105`) and original query parameters. This is for internal investigation.
   - **Sanitized Report**: Redacts IP addresses (e.g., `192.168.x.x`) and hides sensitive parameters like `token`, `password`, or `session`. This is for sharing with external teams or community forums while protecting infrastructure privacy.

## Step 8: History & Cached Sanitization
1. Perform a new analysis and click **Download Sanitized (.md)**.
2. Notice the record in **"Recent Analyses"** now has a **"Sanitized cached"** tag.
3. Refresh the page and select this record from history.
4. You can still download the Sanitized Report even though the original file isn't uploaded, because the result was cached in your browser's storage.
5. If you select a history record *without* the cache and without re-uploading the file, the button will be disabled with a helpful tip.

## Step 9: Clear Current vs. Clear History
1. Perform an analysis or select a record from history.
2. Click the **"Clear Current Result"** button near the top.
3. Observe that the analysis results disappear and the page returns to its initial state.
4. Notice that the **"Recent Analyses"** list still contains all your previous records.
5. Select a record from history again to restore it.
6. Now click **"Clear History"** inside the Recent Analyses section.
7. Observe that all historical records are now removed from the browser's storage.

## 3-Minute Demo Script

Use this script for a quick and effective demonstration of the project.

1.  **Project Introduction (30s)**:
    *   "This is AI Log Security Analyzer, a local-first tool for Nginx log analysis."
    *   "It goes beyond simple parsing by aggregating low-level findings into high-level security incidents."
    *   "Everything runs locally—your logs never leave your machine."

2.  **Upload & Analysis (30s)**:
    *   Open the Web UI.
    *   Drag and drop `samples/nginx_access_sample.log`.
    *   Click "Analyze" and highlight the speed of processing.

3.  **Insight Walkthrough (1m)**:
    *   **Incidents**: Show how multiple probes from one IP are grouped into a single "Advanced Reconnaissance Activity" incident.
    *   **Findings**: Scroll down to show individual findings with specific evidence and recommendations.
    *   **Evidence**: Point out the raw log snippets attached to each finding to show transparency.

4.  **Reporting & Sharing (1m)**:
    *   Show the Markdown preview at the bottom.
    *   Download the **Raw Report** for internal records.
    *   Explain the privacy risk of sharing raw logs, then click **Download Sanitized**.
    *   Show the sanitized report to demonstrate how IPs and tokens are automatically masked.

5. **Bonus: Docker Deployment (Optional)**:
    *   Mention that the entire stack can be launched with `docker compose up --build` for consistent environment setup.

## Customizing Rules (rules.yaml)

You can demonstrate how to change detection thresholds without changing code:

1.  Open `config/rules.yaml`.
2.  Change `high_frequency_threshold` from `10` to `2`.
3.  Run the CLI again:
    ```bash
    python -m app.cli ../samples/nginx_access_sample.log --rules ../config/rules.yaml
    ```
4.  Observe that more IPs are now flagged for "High Frequency Request" in the summary.
