# Crontinel MVP Research Notes

## Date
2026-06-06

## Competitors reviewed
- UptimeRobot
- Cronitor
- cron-job.org

## What competitors emphasize

### UptimeRobot
- Cron job monitoring is a first-class feature.
- Status pages are a major adjacent feature.
- Alerts, incident management, role-based team access, and maintenance windows are important.
- Multi-location checks and response-time alerts are emphasized.
- The product is broader than cron jobs: website, ping, port, keyword, DNS, and status-page monitoring.

### Cronitor
- Cron job monitoring is a core product pillar.
- Heartbeats, uptime checks, analytics, and status pages are bundled into one monitoring platform.
- Execution history, job failure/running states, and developer-oriented workflows are visible.
- The product leans into a simple API and docs for developer use.

### cron-job.org
- Focuses heavily on scheduled execution of websites/scripts.
- Strong emphasis on scheduling flexibility, execution prediction, execution history, custom HTTP requests, test runs, notifications, status pages, badges, and a REST API.
- Very strong on job scheduling and job-run visibility.

## MVP focus implications for Crontinel

### Highest priority
- Reliable cron job triggering.
- Clear success/failure visibility for job runs.
- Basic monitoring that tells users whether the cron job executed.
- Package support that lets different runtimes connect to the cloud cron job flow.

### Likely next priorities after the MVP
- Status space / public status surface.
- Execution history and timelines.
- Notifications and alerting.
- Job test runs.
- Status pages and badges.
- Broader integrations for local machines, startups, and web workloads.

## Current planning conclusion
The MVP should stay narrow: make cloud cron job triggering reliable first, then grow into richer monitoring and status tooling later.
