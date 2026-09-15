from typing import List
from enum import Enum


class ImageUploadTypes(Enum):
    PNG = "image/png"
    JPEG = "image/jpeg"
    JPG = "image/jpg"

    @classmethod
    def get_values(cls) -> List[str]:
        return [item.value for item in cls]

    @classmethod
    def get_names(cls) -> List[str]:
        return [item.name for item in cls]

    @classmethod
    def get_values_as_string(cls) -> str:
        return ",".join(cls.get_values())

    @classmethod
    def get_names_as_string(cls) -> str:
        return ",".join(cls.get_names())
