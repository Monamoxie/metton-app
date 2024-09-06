from knox.models import AuthToken
from datetime import timedelta
from core.message_bag import MessageBag
from identity.serializers import UserSerializer


class UserService:
    TOKEN_NOT_GENERATED_STATUS = MessageBag.UNABLE_TO_GENERATE_DATA.format(data="Token")

    @classmethod
    def create_token(cls, user, remember_user=False):
        token_ttl = timedelta(days=30) if remember_user else timedelta(hours=1)
        token_instance = AuthToken.objects.create(user=user, expiry=token_ttl)

        if token_instance is not None and isinstance(token_instance, tuple):
            # todo ::: just send 2 values as response
            # todo ::: the token instance seraializer and the user serializer
            # todo ::: the user containers normal user data, while the token instance contains the token and expiry
            data = token_instance[0]
            context = {
                "token": token_instance[1],
                "token_exipry": data.expiry,
            }
            user_data = UserSerializer(user, context).data
            return user_data
        else:
            return cls.TOKEN_NOT_GENERATED_STATUS
