from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    MQTT_HOST: str
    MQTT_PORT: int
    MQTT_USER: str
    MQTT_PASSWORD: str
    MQTT_CLIENT_ID: str

    APP_HOST: str
    APP_PORT: int
    CORS_ORIGINS: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()  # pyright: ignore
