import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from temporalio.client import WorkflowExecutionStatus
from temporalio.service import RPCError

from apps.gateway.config import settings
from apps.gateway.routes.auth import current_user_id
from apps.gateway.routes.preflight import check_toolkit_access
from apps.gateway.temporal_client import get_temporal_client

router = APIRouter()

WORKFLOW_NAME = "AgentWorkflow"

class DispatchRequest(BaseModel):
    goal: str
    toolkit: str | None = None
    schedule : str | None = None

class DispatchResponse(BaseModel):
    workflow_id: str
    status: str

class TaskStatusResponse(BaseModel):
    workflow_id: str
    run_id: str | None = None
    status: str | None
    execution_status: str | None
    result: dict | None = None

class TaskListItem(BaseModel):
    workflow_id: str
    run_id: str | None = None
    status: str | None

class CancelResponse(BaseModel):
    workflow_id: str
    status: str


def _owns(workflow_id: str, user_id: str) -> bool:
    return workflow_id.startswith(f"agent-{user_id}-")

@router.post("/dispatch", response_model=DispatchResponse)
async def dispatch(
    body: DispatchRequest,
    user_id: str = Depends(current_user_id),
) -> DispatchResponse:
    if body.toolkit:
        access = await check_toolkit_access(user_id, body.toolkit)
        if not access["allowed"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error": "toolkit_not_connected",
                    "message": f"connect {body.toolkit} before dispatching this task",
                    "toolkit": access["toolkit"],
                    "connect_url": access["connect_url"],
                },
            )

    client = await get_temporal_client()
    workflow_id = f"agent-{user_id}-{uuid.uuid4().hex[:8]}"
    await client.start_workflow(
        WORKFLOW_NAME,
        args=[user_id, body.goal, body.toolkit],
        id=workflow_id,
        task_queue=settings.temporal_task_queue,
        cron_schedule=body.schedule or "",
    )
    return DispatchResponse(workflow_id=workflow_id, status="dispatched")


@router.get("", response_model=list[TaskListItem])
async def list_tasks(user_id: str = Depends(current_user_id)) -> list[TaskListItem]:
    client = await get_temporal_client()
    prefix = f"agent-{user_id}-"
    out: list[TaskListItem] = []
    async for wf in client.list_workflows(
        query=f'WorkflowType = "{WORKFLOW_NAME}"'
    ):
        if wf.id.startswith(prefix):
            out.append(
                TaskListItem(
                    workflow_id=wf.id,
                    run_id=wf.run_id,
                    status=wf.status.name if wf.status else None,
                )
            )
    return out


@router.get("/{workflow_id}", response_model=TaskStatusResponse)
async def get_task(
    workflow_id: str,
    run_id: str | None = None,
    user_id: str = Depends(current_user_id),
) -> TaskStatusResponse:
    # 404 rather than 403 so we don't leak which workflow ids exist
    if not _owns(workflow_id, user_id):
        raise HTTPException(status_code=404, detail="task not found")

    client = await get_temporal_client()
    # pin to a run when given, a cron task has many runs under one workflow_id and
    # the bare handle would always resolve to the latest one
    handle = client.get_workflow_handle(workflow_id, run_id=run_id)

    try:
        desc = await handle.describe()
    except RPCError:
        raise HTTPException(status_code=404, detail="task not found")

    execution_status = desc.status.name if desc.status else None

    agent_status = None
    try:
        agent_status = await handle.query("status")
    except Exception:
        pass

    result = None
    if desc.status == WorkflowExecutionStatus.COMPLETED:
        try:
            result = await handle.query("result")
        except Exception:
            try:
                result = await handle.result()
            except Exception:
                result = None

    return TaskStatusResponse(
        workflow_id=workflow_id,
        run_id=desc.run_id,
        status=agent_status,
        execution_status=execution_status,
        result=result,
    )


@router.delete("/{workflow_id}", response_model=CancelResponse)
async def cancel_task(
    workflow_id: str,
    run_id: str | None = None,
    user_id: str = Depends(current_user_id),
) -> CancelResponse:
    if not _owns(workflow_id, user_id):
        raise HTTPException(status_code=404, detail="task not found")

    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id, run_id=run_id)
    try:
        # signal lets the agent stop gracefully, cancel is the hard backstop
        await handle.signal("cancel_requested")
        await handle.cancel()
    except RPCError:
        raise HTTPException(status_code=404, detail="task not found")

    return CancelResponse(workflow_id=workflow_id, status="cancel_requested")
