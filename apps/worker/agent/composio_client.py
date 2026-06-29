import asyncio
from typing import Any
import structlog
from composio import Composio
from composio.core.provider._openai_responses import OpenAIResponsesProvider
from composio.exceptions import ComposioError
from openai import AsyncOpenAI

from apps.worker.agent.config import settings

log = structlog.get_logger(__name__)

def get_composio()-> Composio:
    global _composio
    if _composio is None:
        _composio = Composio(
            provider = OpenAIResponsesProvider(),
            api_key = settings.composio_api_key
        )
    return _composio

def get_openai_client()-> AsyncOpenAI:
    global _openai
    if _openai is None:
        _openai = AsyncOpenAI(api_key=settings.openai_api_key)
    return _openai

async def create_session(user_id: str, toolkit_hint: str |None = None)-> Any:
    composio = get_composio()

    if toolkit_hint:
        try:
            return await asyncio.to_thread(
                composio.create,
                user_id = user_id,
                toolkit_hint = [toolkit_hint],
                manage_connections = True
            )
        except ComposioError as e:
            log.warning(
                "composio.create.toolkit_hint_failed",
                user_id = user_id,
                toolkit_hint = toolkit_hint,
                error = str(e)
            )

    return await asyncio.to_thread(
        composio.create,
        user_id = user_id,
        manage_connections = True
    )

async def get_tools(session: Any) -> List[ToolParam]:
    return await asyncio.to_thread(session.tools)

async def execute_tool_calls(session: Any, tool_use_blocks: list[Any])-> list[dict]:
    results: list[dict] = []
    for block in tool_use_blocks:
        resp = await asyncio.to_thread(
            session.execute,
            block.name,
            arguments = dict(block.input or {})
        )
        results.append(
            {
                "data": getattr(resp, "data", None),
                "error": getattr(resp, "error", None),
                "log_id": getattr(resp,"_log_id", None)
              }
        )
    return results





