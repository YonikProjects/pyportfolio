import os

from dotenv import load_dotenv


try:
    load_dotenv()
except OSError as e:
    raise SystemExit(f"Error loading .env file: {e}")

required_envs = [
    "CMS",
    "TURNSTILE",
    "SENDGRID",
    "TOEMAIL",
    "FROMEMAIL",
    "DEV",
    "PRERENDER",
    "CAPTAIN",
    "CMSTOKEN",
]

for env in required_envs:
    if env not in os.environ:
        raise EnvironmentError(f"Required environment variable {env} not set.")

CMS = os.environ["CMS"]
TURNSTILE = os.environ["TURNSTILE"]
SENDGRID = os.environ["SENDGRID"]
TOEMAIL = os.environ["TOEMAIL"]
FROMEMAIL = os.environ["FROMEMAIL"]
DEV = os.environ["DEV"]
PRERENDER = os.environ["PRERENDER"]
CAPTAIN = os.environ["CAPTAIN"]
CMSTOKEN = os.environ["CMSTOKEN"]
