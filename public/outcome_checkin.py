#!/usr/bin/env python3
"""Send a background-job receipt. Exit code and business result stay separate.

A completed process can still report zero records. Omitting the count does not
invent a healthy metric. The server evaluates outcome rules; this script only
delivers the receipt.

Dry run prints the JSON body. Posting requires --url and --api-key.
"""
import argparse
import json
import shlex
import urllib.error
import urllib.request


def build_receipt(
    *,
    command,
    request_key,
    exit_code,
    started_at,
    finished_at,
    processed_records=None,
    latest_artifact_at=None,
    metric_name="processed_records",
    timestamp_name="latest_artifact",
    status=None,
    job_name=None,
):
    # A rule registered with a job_name only applies to runs that send the same job_name.
    identity = {"job_name": job_name} if job_name else {}
    if status == "running":
        # Start receipt: enables the unfinished-run alert. No result is known yet.
        return {
            "request_key": request_key,
            "command": command,
            **identity,
            "status": "running",
            "started_at": started_at,
        }
    body = {
        "request_key": request_key,
        "command": command,
        **identity,
        "status": "completed" if exit_code == 0 else "failed",
        "exit_code": exit_code,
        "started_at": started_at,
        "finished_at": finished_at,
    }
    outcomes = {}
    if processed_records is not None:
        if isinstance(processed_records, bool) or not isinstance(processed_records, (int, float)):
            raise ValueError("processed_records must be a finite number")
        outcomes["metrics"] = {metric_name: processed_records}
    if latest_artifact_at is not None:
        outcomes["timestamps"] = {timestamp_name: latest_artifact_at}
    if outcomes:
        body["outcomes"] = outcomes
    return body


def build_schedule(
    *,
    command,
    expression=None,
    job_name=None,
    timezone=None,
    grace_seconds=None,
    max_runtime_seconds=None,
    counted_minimum=None,
    environment=None,
):
    """Body for POST /api/v1/ingest/schedule. Unset fields are omitted so server defaults apply."""
    task = {"command": command}
    optional = {
        "job_name": job_name,
        "environment": environment,
        "expression": expression,
        "timezone": timezone,
        "grace_seconds": grace_seconds,
        "max_runtime_seconds": max_runtime_seconds,
        "counted_minimum": counted_minimum,
    }
    task.update({key: value for key, value in optional.items() if value is not None})
    return {"source": "named_by_user", "tasks": [task]}


def curl_command(body, url="https://app.crontinel.com", path="/api/v1/ingest/cron"):
    """Printable request. The ingest key stays in the environment, not in the command."""
    origin = url.rstrip("/")
    if origin.endswith("/api"):
        origin = origin[:-4]
    payload = json.dumps(body, separators=(",", ":"))
    return " ".join([
        "curl -sS -X POST",
        shlex.quote(origin + path),
        "-H",
        shlex.quote("Authorization: Bearer $CRONTINEL_INGEST_KEY"),
        "-H",
        shlex.quote("Content-Type: application/json"),
        "-d",
        shlex.quote(payload),
    ])


def main(argv=None):
    parser = argparse.ArgumentParser(description="Post a Crontinel cron receipt with an optional business result.")
    parser.add_argument("--command", required=True)
    parser.add_argument("--request-key")
    parser.add_argument("--exit-code", type=int, default=0)
    parser.add_argument("--started-at")
    parser.add_argument("--finished-at")
    parser.add_argument("--status", choices=["running", "final"], default="final", help="running sends a start receipt; final (default) sends completed or failed from the exit code.")
    parser.add_argument("--register-schedule", action="store_true", help="Register the job and its cron expression instead of posting a run.")
    parser.add_argument("--job-name")
    parser.add_argument("--expression", help="Five-field cron expression. Needed for missed-run alerts.")
    parser.add_argument("--timezone")
    parser.add_argument("--grace-seconds", type=int)
    parser.add_argument("--max-runtime-seconds", type=int)
    parser.add_argument("--counted-minimum", type=float, help="Minimum processed_records for a passing run.")
    parser.add_argument("--records", type=float, default=None, help="Business count. Zero is sent. Omit the flag to send no metric.")
    parser.add_argument("--metric-name", default="processed_records")
    parser.add_argument("--latest-artifact-at", default=None, help="Timestamp value. Named latest_artifact unless --timestamp-name is set.")
    parser.add_argument("--timestamp-name", default="latest_artifact", help="For example latest_event on a webhook window.")
    parser.add_argument("--url", help="Ingest origin, for example https://app.crontinel.com")
    parser.add_argument("--api-key", help="App ingest key. Never an MCP key.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--print-curl", action="store_true", help="Print a curl command. The ingest key stays in $CRONTINEL_INGEST_KEY.")
    args = parser.parse_args(argv)
    if args.register_schedule:
        minimum = args.counted_minimum
        if minimum is not None and minimum.is_integer():
            minimum = int(minimum)
        body = build_schedule(
            command=args.command,
            expression=args.expression,
            job_name=args.job_name,
            timezone=args.timezone,
            grace_seconds=args.grace_seconds,
            max_runtime_seconds=args.max_runtime_seconds,
            counted_minimum=minimum,
        )
        return deliver(args, body, "/api/v1/ingest/schedule")
    missing = [flag for flag, value in (("--request-key", args.request_key), ("--started-at", args.started_at)) if not value]
    if args.status != "running" and not args.finished_at:
        missing.append("--finished-at")
    if missing:
        parser.error("the following arguments are required: " + ", ".join(missing))
    if args.records is not None and args.records != args.records:
        raise SystemExit("records must be a finite number")
    records = None if args.records is None else (int(args.records) if args.records.is_integer() else args.records)
    body = build_receipt(
        command=args.command,
        request_key=args.request_key,
        exit_code=args.exit_code,
        started_at=args.started_at,
        finished_at=args.finished_at,
        processed_records=records,
        latest_artifact_at=args.latest_artifact_at,
        metric_name=args.metric_name,
        timestamp_name=args.timestamp_name,
        status="running" if args.status == "running" else None,
        job_name=args.job_name,
    )
    return deliver(args, body, "/api/v1/ingest/cron")


def deliver(args, body, path):
    encoded = json.dumps(body, indent=2) + "\n"
    if args.print_curl:
        print(curl_command(body, args.url or "https://app.crontinel.com", path))
        return 0
    if args.dry_run or not args.url:
        print(encoded, end="")
        if not args.dry_run and not args.url:
            raise SystemExit("Pass --url and --api-key to post, or --dry-run to print only.")
        return 0
    if not args.api_key:
        raise SystemExit("--api-key is required when posting")
    origin = args.url.rstrip("/")
    if origin.endswith("/api"):
        origin = origin[:-4]
    request = urllib.request.Request(
        origin + path,
        data=encoded.encode(),
        # Accept JSON so a rejection (409, 422) explains itself instead of returning an HTML error page.
        headers={"Authorization": "Bearer " + args.api_key, "Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            print(response.read().decode() or response.status)
    except urllib.error.HTTPError as error:
        detail = error.read().decode()
        raise SystemExit(f"Ingest rejected the receipt: HTTP {error.code} {detail}") from error
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
