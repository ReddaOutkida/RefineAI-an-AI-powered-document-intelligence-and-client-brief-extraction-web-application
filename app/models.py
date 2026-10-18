from typing import List, Optional
from datetime import datetime

class UserModel:
    def __init__(self, username: str, email: str, hashed_password: str, docs: Optional[List[str]] = None):
        self.username = username
        self.email = email
        self.hashed_password = hashed_password
        self.docs = docs or []

class DocumentModel:
    def __init__(self, user_id: str, filename: str, upload_date: datetime, metadata: dict, file_path: str):
        self.user_id = user_id
        self.filename = filename
        self.upload_date = upload_date
        self.metadata = metadata
        self.file_path = file_path 