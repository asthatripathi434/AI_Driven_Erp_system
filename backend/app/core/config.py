from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DB_NAME: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # School Info
    SCHOOL_NAME: str
    SCHOOL_PLACE: str

    # Razorpay
    RAZORPAY_KEY_ID: str
    RAZORPAY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str   # ✅ must match .env and Razorpay Dashboard
    VERIFY_SIGNATURE: bool = True  # ✅ added this field to sync with .env

    # SMTP / Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASS: str
    SMTP_FROM: str

    # Excel / Accounts
    EXCEL_PATH: str
    ACCOUNT_NAME: str
    ACCOUNT_NUMBER: str
    IFSC: str
    BANK_NAME: str
    UPI_ID: str

    # ✅ Pydantic v2 style config
    model_config = SettingsConfigDict(env_file=".env")

# ✅ Instantiate settings
settings = Settings()