from rest_framework.throttling import AnonRateThrottle
from rest_framework.exceptions import Throttled

from core import settings

class SignupRateThrottle(AnonRateThrottle):
    rate = "5/hour"

    def throttle_failure(self):
        raise Throttled(detail="You have exceed the maximum number of requests. Please try again after 1 hour.")
    
    def allow_request(self, request, view):
        # Skip throttle in non-production environments
        if settings.PROJECT_ENV != 'production':
            return True  
        
        return super().allow_request(request, view)