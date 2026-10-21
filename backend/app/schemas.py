from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Literal["guest", "host"]

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("Name must contain at least 2 characters.")
        return cleaned

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Literal["guest", "host"]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class PropertyCreate(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str = Field(min_length=10, max_length=1500)
    location: str = Field(min_length=2, max_length=100)
    price_per_night: float = Field(gt=0, le=1000000)
    amenities: list[str] = Field(default_factory=list, max_length=20)
    image_url: str = Field(default="", max_length=1000)

    @field_validator("title", "description", "location")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("amenities")
    @classmethod
    def clean_amenities(cls, values: list[str]) -> list[str]:
        cleaned = [item.strip() for item in values if item.strip()]
        return cleaned[:20]

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: str) -> str:
        cleaned = value.strip()
        if cleaned and not cleaned.startswith(("https://", "http://")):
            raise ValueError("Image URL must start with http:// or https://.")
        return cleaned


class PropertyUpdate(PropertyCreate):
    pass


class BookingCreate(BaseModel):
    property_id: str = Field(min_length=1, max_length=100)
    check_in: date
    check_out: date

    @model_validator(mode="after")
    def check_date_order(self):
        if self.check_out <= self.check_in:
            raise ValueError("Check-out must be after check-in.")
        return self
