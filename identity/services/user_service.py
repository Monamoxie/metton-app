from typing import Union
from knox.models import AuthToken
from datetime import timedelta

from identity.serializers import AuthTokenSerializer
from core.message_bag import MessageBag
from identity.serializers import UserSerializer


class UserService:
    TOKEN_NOT_GENERATED_STATUS = MessageBag.UNABLE_TO_GENERATE_DATA.format(data="Token")
    CANNOT_VALIDATE_TOKEN_STATUS = MessageBag.UNABLE_TO_VALIDATE_DATA.format(
        data="Token"
    )

    @classmethod
    def create_token(cls, user, remember_user=False) -> Union[str, object]:
        token_ttl = timedelta(days=30) if remember_user else timedelta(hours=1)
        token_instance = AuthToken.objects.create(user=user, expiry=token_ttl)

        if token_instance is not None and isinstance(token_instance, tuple):
            data = token_instance[0]
            context = {
                "token": token_instance[1],
                "expiry": data.expiry,
            }
            auth_token = AuthTokenSerializer(data=context)
            user = UserSerializer(instance=user)

            if not auth_token.is_valid():
                return cls.CANNOT_VALIDATE_TOKEN_STATUS

            return {"token": auth_token.data, "user": user.data}

        else:
            return cls.TOKEN_NOT_GENERATED_STATUS
