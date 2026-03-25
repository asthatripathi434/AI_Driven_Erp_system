from pydantic import BaseModel

class Student(BaseModel):
    name: str
    age: int
    class_name: str