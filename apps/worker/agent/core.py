import json

import structlog
from composio_client import ComposioError
from openai.types.chat import ChatCompletionMessageParam

from apps.worker.agent.composio_client import get_openai_client, create_session, get_tools, execute_tool_calls
from apps.worker.agent.config import settings
from apps.worker.agent.prompts import SYSTEM_PROMPT

log = structlog.get_logger(__name__)

async def _summarize_tool_calls(tool_calls: list[Any]| None)-> list[dict]:
    if not tool_calls:
        return []
    return [
        {"name": tc.function.name, "input": json.loads(tc.function.arguments)}
        for tc in tool_calls
    ]

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
    session = await create_session(user_id, toolkit_hint)
    tools = await get_tools(session)

    messages = list[ChatCompletionMessageParam] = [
        {'role': "system","context": SYSTEM_PROMPT},
        {'role': "user", "content": goal}
    ]
    for turn in range(1, settings.max_iterations + 1):
        log.info("turn.start", user_id=user_id, turn=turn, toolkit_hint=toolkit_hint)

        response = await client.chat.completions.create(
            model=settings.model,
            max_tokens=settings.max_tokens,
            tools=tools,
            messages=messages,
        )

        message = response.choices[0].message
        tool_calls = message.tool_calls
        summary_calls = _summarize_tool_calls(tool_calls)

        steps.append(
            {
                "turn": turn,
                "stop_reason": response.choices[0].finish_reason,
                "tool_calls": summary_calls,
            }
        )
        log.info(
            "turn.result",
            user_id=user_id,
            turn=turn,
            stop_reason=response.choices[0].finish_reason,
            tools=[c["name"] for c in summary_calls],
            text=(message.content[:200] if message.content else None),
        )

        # Handle completion
        if response.choices[0].finish_reason == "stop":
            return finish("completed", message.content or "Task completed.")

        # Handle tool calls
        if response.choices[0].finish_reason == "tool_calls" and tool_calls:
            # Append assistant message with tool calls
            messages.append(message)

            # Prepare blocks for execute_tool_calls (mapping OpenAI tool calls to the expected format)
            # Since your composio_client.py expects blocks with .name and .input:
            tool_use_blocks = [
                type('Block', (), {'name': tc.function.name, 'input': json.loads(tc.function.arguments), 'id': tc.id})
                for tc in tool_calls
            ]

            try:
                results = await execute_tool_calls(session, tool_use_blocks)
                for tc, result in zip(tool_calls, results):
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": json.dumps(result, default=str),
                    })
            except ComposioError as exc:
                log.warning("tool.execution_failed", user_id=user_id, turn=turn, error=str(exc))
                for tc in tool_calls:
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": f"Tool execution failed: {exc}",
                    })
            continue

        log.warning(
            "agent.unexpected_stop", user_id=user_id, stop_reason=response.choices[0].finish_reason
        )
        return finish(
            "error",
            message.content or f"Stopped with unexpected reason: {response.choices[0].finish_reason}.",
        )

    return finish(
        "max_iterations_reached",
        f"Reached the {settings.max_iterations}-iteration limit before completing.",
    )
