from composio_client import Client

from apps.gateway.config import settings


async def get_temporal_client() -> Client:
    return await Client.connect(
        settings.temporal_host,
        namespace= settings.temporal_namespace,
    )
