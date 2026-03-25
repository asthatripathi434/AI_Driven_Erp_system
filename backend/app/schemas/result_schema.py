from pydantic import BaseModel
from typing import Dict

class Result(BaseModel):
    student_id: str
    term: str
    subjects: Dict[str, float]  # e.g., {"Math": 88, "Science": 92}