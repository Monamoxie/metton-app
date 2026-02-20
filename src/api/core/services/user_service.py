import uuid
from typing import Union
from dashboard.models.user import User


class UserService:
    NO_USER_FOUND_MESSAGE = "No user found"

    def generate_email_verification_link(self): ...

    def generate_unique_public_id(self):
        id_exists = True
        while id_exists:
            p_id = uuid.uuid4().hex[:7]
            if not User().objects.filter(public_id=p_id).exists():
                id_exists = False
        return p_id

    @staticmethod
    def get_user_by_email(email: str) -> Union[User, None]:
        return User.objects.filter(email=email).first()
