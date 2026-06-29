from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from activities import notify_activity, run_agent_activity


@workflow.defn(name="AgentWorkflow")
class AgentWorkflow:
    def __init__(self)-> None:
        self.status: str = "running"
        self.result: dict | None = None
        self._cancel_requested : bool = False

    @workflow.run
    async def run(
            self,
            user_id: str,
            goal: str,
            toolkit_hint: str | None = None
            )-> dict:
        retry = RetryPolicy(
            initial_interval= timedelta(seconds= 3),
            backoff_coefficient= 2.0,
            maximum_interval= timedelta(minutes=2),
            maximum_attempts= 5,
            non_retryable_error_types= ["ValueError", "AuthenticationError"]
        )
        result = await workflow.execute_activity(
            run_agent_activity,
            args = [user_id, goal, toolkit_hint],
            start_to_close_timeout= timedelta(minutes=10),
            retry_policy = retry
        )
        self.result = result
        self._status = "completed"

        await workflow.execute_activity(
            notify_activity,
            args = [user_id, result],
            start_to_close_timeout = timedelta(seconds=30),
            retry_policy = retry
        )
        return result

    @workflow.query
    def status(self)-> str:
        return self._status

    @workflow.query
    def result(self)-> dict | None:
        return self.result

    @workflow.signal
    async def cancel_requested(self)-> None:
        self._cancel_requested = True


