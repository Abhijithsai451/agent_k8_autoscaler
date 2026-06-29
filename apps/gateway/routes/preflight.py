import asyncio

from composio import Composio
from composio.core.provider._openai_responses import OpenAIResponsesProvider

from apps.gateway.config import settings


def _get_composio()-> Composio:
    global _composio
    if _composio is None:
        _composio = Composio(
            provider=OpenAIResponsesProvider(),
            api_key=settings.composio_api_key
        )
    return _composio

def _has_active_account(composio: Composio, user_id : str, toolkit: str)-> bool:
    resp = composio._client.connected_accounts.list(
        user_id = [user_id],
        toolkit = [toolkit],
        statuses = ["ACTIVE"]
    )
    items = getattr(resp, "items", resp)
    return bool(items)

def _connect_link(composio: Composio, user_id: str, toolkit: str)-> str | None:
    session = composio.create(user_id = user_id, toolkits= [toolkit])
    request = session.authorize(toolkit)
    return getattr(request,"redirect_url", None)

async def check_toolkit_access(user_id: str, toolkit_hint: str)-> str |None:
    # no named toolkit means we can't know what a free-form goal needs, so allow it
    if not toolkit_hint:
        return {"allowed": True}
    composio = _get_composio()

    connected = await asyncio.to_thread(
        _has_active_account,
        composio,
        user_id,
        toolkit_hint
    )
    if connected:
        return {"allowed": True}

    connect_url = await asyncio.to_thread(
        _connect_link, composio, user_id, toolkit_hint
    )
    return {"allowed": False, "toolkit": toolkit_hint, "connect_url": connect_url}



