from datetime import datetime
from core import settings
from core.data.template_data import TemplateData


def template_data(request):
    return {"template_data": TemplateData()}
