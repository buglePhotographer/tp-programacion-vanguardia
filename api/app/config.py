from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/plataforma_academica")
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-cambiar-en-produccion")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
SENTRY_DSN = os.getenv("SENTRY_DSN", "")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
NEW_RELIC_LICENSE_KEY = os.getenv("NEW_RELIC_LICENSE_KEY", "")
NEW_RELIC_APP_NAME = os.getenv("NEW_RELIC_APP_NAME", "plataforma-academica")
