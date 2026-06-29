"""Temporal connection settings for the worker and dispatch script.

Separate from agent.config on purpose, that one belongs to the agent core and we don't
touch it (its extra="ignore" drops these keys anyway). Same .env though.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict

class TemporalSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    temporal_host: str = "localhost:7233"
    temporal_namespace: str = "default"
    temporal_task_queue: str = "agent-tasks"


temporal_settings = TemporalSettings()
