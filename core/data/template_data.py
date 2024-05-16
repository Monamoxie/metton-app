from core import settings
from datetime import datetime


class TemplateData:
    def __init__(self):
        self.base_url = settings.BASE_URL.rstrip().rstrip("/")
        self.project_name = settings.PROJECT_NAME
        self.curr_year = datetime.today().year
