"""Fire off an AgentWorkflow and wait for the result, no gateway needed.

    python dispatch_test.py --user alice --goal "list my next 5 google calendar events"
    python dispatch_test.py --user alice --toolkit googlecalendar --goal "list my events"

Wanna see durability? Start a longer goal, Ctrl-C the worker mid-run, then bring it
back. Temporal re-runs the activity and it finishes, and you can watch the retry in the
UI at http://localhost:8088.
"""
import argparse
import asyncio
import json
import uuid
from workflows import AgentWorkflow
from temporal_config import temporal_settings
from temporalio.client import Client


async def main() -> None:
    parser = argparse.ArgumentParser(description="Dispatch an AgentWorkflow.")
    parser.add_argument("--user", default="local-test", help="Composio user_id.")
    parser.add_argument("--toolkit", default=None, help="Optional toolkit to scope to.")
    parser.add_argument("--goal", required=True, help="The goal to run.")
    args = parser.parse_args()

    client = await Client.connect(
        temporal_settings.temporal_host,
        namespace=temporal_settings.temporal_namespace,
    )

    workflow_id = f"agent-{args.user}-{uuid.uuid4().hex[:8]}"
    handle = await client.start_workflow(
        AgentWorkflow.run,
        args=[args.user, args.goal, args.toolkit],
        id=workflow_id,
        task_queue=temporal_settings.temporal_task_queue,
    )

    print(f"started workflow {workflow_id}")
    print("watch it at http://localhost:8088")

    result = await handle.result()
    print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    asyncio.run(main())
