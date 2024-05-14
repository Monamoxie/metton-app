from datetime import datetime
from core import settings


def curr_year(request):
    return {"curr_year": datetime.today().year}


def base_url(request):
    return {"base_url": settings.BASE_URL.rstrip().rstrip("/")}
