from django.core import serializers


class EventSerializer:
    """Serializes the EVENT model into a consistent format, suitable for small to medium-sized datasets.

    - IDEAL for mapping model data to structured representations.
    - IDEAL for scenarios where you seek to regulate the quantity and nature of fields included in the response.
    - AVOID usage with large datasets to prevent performance issues;
    - Instead, query only the necessary fields directly to enhance retrieval efficiency.
    """

    def __init__(self, instance):
        self.instance = instance

    def to_json(self):
        event_data = {
            "id": self.instance.id,
            "title": self.instance.title,
            "start_date": self.instance.start_date.strftime("%Y-%m-%d"),
            "start_time": self.instance.start_time.strftime("%H:%M:%S"),
            "end_date": self.instance.end_date.strftime("%Y-%m-%d"),
            "end_time": self.instance.end_time.strftime("%H:%M:%S"),
            "timezone": self.instance.timezone,
            "type": self.instance.type,
            "frequency": self.instance.frequency,
            "end_recur": (
                self.instance.end_recur.strftime("%Y-%m-%d")
                if self.instance.end_recur
                else None
            ),
            # Custom field example
            "custom_field": "custom_value",
        }
        # Add any additional transformations here
        return event_data

    @classmethod
    def collect(cls, queryset):
        return [cls(instance).to_dict() for instance in queryset]

    def to_xml(queryset, fields):
        data = serializers.serialize("xml", queryset, fields=fields)
        # Custom XML serialization logic
        return data

    # def to_json(queryset, fields):
    #     data = serializers.serialize("json", queryset, fields=fields)
    #     # Custom JSON serialization logic
    #     return data
