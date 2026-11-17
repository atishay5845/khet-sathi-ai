from pydantic import BaseModel, Field, field_validator


class AdvisoryRequest(BaseModel):
    crop: str = Field(min_length=2, max_length=40)
    location: str = Field(min_length=2, max_length=120)
    stage: str = Field(min_length=2, max_length=60)
    land_area: float = Field(gt=0, le=10000)
    unit: str = "acres"
    language: str = "English"

    @field_validator("crop", "location", "stage")
    @classmethod
    def strip_values(cls, value: str) -> str:
        return value.strip()
