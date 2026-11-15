import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AstroCare AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "astrocare-mission-control-secret-key-alpha-9")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./astrocare.db")

settings = Settings()
