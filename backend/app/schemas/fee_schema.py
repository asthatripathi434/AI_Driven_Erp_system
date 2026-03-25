from pydantic import BaseModel

class FeeBreakdown(BaseModel):
    tuition: float
    exam: float
    dress: float
    transport: float = 0.0
    paid: float = 0.0