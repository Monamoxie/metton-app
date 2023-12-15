import uuid

# from dashboard.models import User

# from dashboard.models import User


class UserService:
    def generate_unique_public_id(self):
        id_exists = True
        while id_exists:
            p_id = uuid.uuid4().hex[:7]
            if not User().objects.filter(public_id=p_id).exists():
                id_exists = False
        return p_id
