from temporalio import activity

from apps.worker.agent import run_agent


@activity.defn(name="run_agent_activity")
async def run_agent_activity(
    user_id : str,
    goal: str,
    toolkit_hint: str | None ) -> dict:
    activity.logger.info("run_agent_activity start", extra={"user_id": user_id, "goal":goal})

    result = await run_agent(user_id, goal, toolkit_hint= toolkit_hint)

    activity.logger.inof(
        "run_agent_activity done",
        extra={"user_id": user_id,
               "status": result.get("status"),
               "steps_taken": result.get("steps_taken")
               }
    )
    return result

@activity.defn(name="notify_activity")
async def notify_activity(user_id: str, result: dict)-> None:
    activity.logger.info(
        "notify",
        extra={
            "user_id": user_id,
            "status": result.get("status"),
            "summary": (result.get("summary") or "")[:200],
        }
    )




