import csv
import io
import os

import openpyxl

from core.message_bag import MessageBag
from workspace.exceptions import InvalidBulkInviteFileError

REQUIRED_COLUMNS = {"email", "role"}


class BulkInviteFileParserService:
    """Turns an uploaded CSV/Excel file into `[{"email": ..., "role": ...}, ...]` rows.

    Deliberately does NOT validate email format or role values — that's
    `WorkspaceInviteEntrySerializer`'s job, reused unchanged by the view that calls this.
    """

    MAX_ROWS = 500

    @classmethod
    def parse(cls, uploaded_file) -> list[dict]:
        extension = os.path.splitext(uploaded_file.name)[1].lower()

        if extension == ".csv":
            rows = cls._parse_csv(uploaded_file)
        elif extension in (".xlsx", ".xls"):
            rows = cls._parse_excel(uploaded_file)
        else:
            raise InvalidBulkInviteFileError(
                "Unsupported file type — upload a .csv or .xlsx file"
            )

        if not rows:
            raise InvalidBulkInviteFileError("The file has no data rows")

        if len(rows) > cls.MAX_ROWS:
            raise InvalidBulkInviteFileError(
                f"Too many rows — {len(rows)} found, max {cls.MAX_ROWS} per upload"
            )

        return rows

    @classmethod
    def _parse_csv(cls, uploaded_file) -> list[dict]:
        text = io.TextIOWrapper(uploaded_file.file, encoding="utf-8")
        reader = csv.DictReader(text)
        return cls._extract_rows(reader.fieldnames, reader)

    @classmethod
    def _parse_excel(cls, uploaded_file) -> list[dict]:
        workbook = openpyxl.load_workbook(uploaded_file, read_only=True, data_only=True)
        sheet = workbook.worksheets[0]
        sheet_rows = sheet.iter_rows(values_only=True)

        try:
            headers = next(sheet_rows)
        except StopIteration:
            headers = None

        dict_rows = (
            dict(zip(headers, row)) for row in sheet_rows if headers is not None
        )
        return cls._extract_rows(headers, dict_rows)

    @classmethod
    def _extract_rows(cls, headers, dict_rows) -> list[dict]:
        if not headers:
            raise InvalidBulkInviteFileError(
                MessageBag.FIELD_IS_REQUIRED.format(field="email, role columns")
            )

        normalized_headers = {
            str(header).strip().lower(): header for header in headers if header
        }
        missing = REQUIRED_COLUMNS - normalized_headers.keys()
        if missing:
            raise InvalidBulkInviteFileError(
                f"Missing required column(s): {', '.join(sorted(missing))}"
            )

        email_key = normalized_headers["email"]
        role_key = normalized_headers["role"]

        rows = []
        for row in dict_rows:
            email = row.get(email_key)
            role = row.get(role_key)
            if email is None and role is None:
                continue
            rows.append(
                {
                    "email": str(email).strip() if email is not None else "",
                    "role": str(role).strip() if role is not None else "",
                }
            )
        return rows
