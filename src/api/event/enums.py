from typing import Union
from enum import Enum


class EventTypes(Enum):
    PUBLIC = "1"
    BUSINESS_HOURS = "2"
    UNAVAILABLE = "3"

    @classmethod
    def options(cls):
        return [(key.value, key.get_name()) for key in cls]

    def get_name(self):
        """
        Reconstruct the name property and return a more friendly looking name
        """
        return self.name.replace("_", " ").title()

    @classmethod
    def get_name_by_value(cls, value: str) -> Union[str, None]:
        """
        Return the friendly name for a given value.
        """
        try:
            member = cls._value2member_map_.get(value)
            return member.get_name()
        except:
            raise ValueError(f"No member with value {value}")


class RecurrenceTypes(Enum):
    NO_REPEAT = "no"
    EVERY_SUNDAY = "0"
    EVERY_MONDAY = "1"
    EVERY_TUESDAY = "2"
    EVERY_WEDNESDAY = "3"
    EVERY_THURSDAY = "4"
    EVERY_FRIDAY = "5"
    EVERY_SATURDAY = "6"

    @classmethod
    def options(cls):
        return {option.value: option.name.replace("_", " ").title() for option in cls}


class RepeatOption(Enum):
    """
    UI-only "Repeats" dropdown options for the booking frequency field. Never persisted —
    "daily"/"weekly" are resolved client-side into RecurrenceTypes day indices before submit.
    """

    NO_REPEAT = "no"
    DAILY = "daily"
    WEEKLY = "weekly"

    @classmethod
    def options(cls):
        labels = {
            "no": "Does not repeat",
            "daily": "Daily",
            "weekly": "Weekly",
        }
        return {option.value: labels[option.value] for option in cls}
