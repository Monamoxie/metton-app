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
        We reconstruct the name property and return a more friendly looking name
        """
        return self.name.replace("_", " ").title()


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
