from enum import Enum
from typing import Dict, List


class VerificationTokenTypes(Enum):
    EMAIL_VERIFICATION = "email_verification"
    PHONE_VERIFICATION = "phone_verification"

    @classmethod
    def options(cls) -> Dict:
        return {option.value: option.name.replace("_", " ").title() for option in cls}

    @classmethod
    def get_names(cls) -> List[str]:
        return [str(option.name.replace("_", "").title) for option in cls]

    @classmethod
    def get_values(cls) -> List[str]:
        return [option.value for option in cls]
