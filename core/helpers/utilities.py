from datetime import datetime


def curr_year(request):
    return {"curr_year": datetime.today().year}
