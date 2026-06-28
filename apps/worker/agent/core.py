import structlog
from openai.types.chat import (ChatCompletionMessageParam,
                               ChatCompletionAssistantMessageParam,
                               ChatCompletionToolMessageParam)

from apps.worker.agent.composio_client import get_openai_client

log = structlog.get_logger(__name__)


async def run_agent(
        user_id: str,
        goal: str,
        toolkit_hint: str | None = None,
) -> dict:
    steps: list[dict] = []
    def finish(status: str, summary: str)-> dict:
        log.info("agent.done", user_id = user_id, status = status, steps = len(steps))
        return {
            "status": status,
            "summary": summary,
            "steps_taken": len(steps),
            "steps": steps
        }
    if not goal or not goal.strip():
        log.warnning("agent.empty_goal", user_id = user_id)
        return finish("empty_goal", "No goal provided")

    client = get_openai_client()
    sessiondominos