import os
from core import settings
from core.data.template_data import TemplateData


def template_data(request):
    return {"template_data": TemplateData()}


def get_template_path(app: str, relative_path: str) -> str:
    path = f"{app}/templates/{app}/{relative_path}"
    return os.path.join(settings.BASE_DIR, path)
