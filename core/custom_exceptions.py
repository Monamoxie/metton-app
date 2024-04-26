from abc import ABC


class CustomException(ABC, Exception):

    def __init__(self, code: int, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(message)


class InvalidInputException(CustomException):

    def __init__(self, message="Invalid input"):
        code = 422
        super().__init__(code, message)


class DatabaseError(CustomException):

    def __init__(self, message="Database error"):
        code = 500
        super().__init__(code, message)
