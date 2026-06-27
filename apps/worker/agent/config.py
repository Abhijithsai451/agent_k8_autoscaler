from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    openai_api_key: str
    composio_api_key: str

    model: str = "gpt-4o-mini"
    max_tokens: int = 4096
    max_iterations : int = 20


settings = Settings()