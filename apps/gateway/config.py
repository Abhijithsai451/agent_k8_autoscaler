from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    gateway_host: str = "0.0.0.0"
    gateway_port: int = 8000
    cors_origins: str = "https://localhost:3000"

    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes : int = 10080

    temporal_host: str = "localhost:7233"
    temporal_namespace: str = "default"
    temporal_task_queue: str = "agent-tasks"

    composio_api_key: str = ""

    @property
    def cors_origins_list(self)-> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

settings = Settings()



