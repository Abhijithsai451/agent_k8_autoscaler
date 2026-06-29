"""Worker entrypoint. Registers the workflow + activities and polls the queue. Needs
the docker-compose Temporal stack up.

    python worker.py
"""
import asyncio
import logging
from temporalio.client import Client
from temporalio.worker import Worker
from apps.activities import run_agent_activity, notify_activity
from apps.temporal_config import temporal_settings
from apps.workflows import AgentWorkflow

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("worker")

async def main() -> None:
    client = await Client.connect(
        temporal_settings.temporal_host,
        namespace = temporal_settings.temporal_namespace,
    )

    worker = Worker(
        client,
        task_queue = temporal_settings.temporal_task_queue,
        workflows = [AgentWorkflow],
        activities = [run_agent_activity, notify_activity],
        max_concurrent_activities = 6,
    )

    log.info("Worker ready on task queue %r", temporal_settings.temporal_task_queue)
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())