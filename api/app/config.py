from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/plataforma_academica")
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-cambiar-en-produccion")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
