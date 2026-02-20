from enum import Enum
from typing import Dict, List


class NotificationChannels(Enum):
    EMAIL = "email"
    SMS = "sms"

    @classmethod
    def options(cls) -> Dict:
        return {option.value: option.name.replace("_", " ").title() for option in cls}

    @classmethod
    def get_names(cls) -> List[str]:
        return [str(option.name.replace("_", "").title) for option in cls]

    @classmethod
    def get_values(cls) -> List[str]:
        return [option.value for option in cls]
