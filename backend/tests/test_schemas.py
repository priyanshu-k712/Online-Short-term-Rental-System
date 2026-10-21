from datetime import date, timedelta

import pytest
from pydantic import ValidationError

from app.schemas import BookingCreate, PropertyCreate, UserCreate


def test_user_requires_valid_email_and_eight_character_password():
    with pytest.raises(ValidationError):
        UserCreate(name="Test User", email="not-an-email", password="123", role="guest")


def test_user_email_is_lowercase():
    user = UserCreate(
        name="Test User",
        email="TEST@example.com",
        password="password123",
        role="guest",
    )
    assert user.email == "test@example.com"


def test_property_rejects_zero_or_negative_price():
    with pytest.raises(ValidationError):
        PropertyCreate(
            title="Small flat",
            description="A useful test description",
            location="Ahmedabad",
            price_per_night=0,
        )


def test_booking_rejects_checkout_before_or_equal_to_checkin():
    tomorrow = date.today() + timedelta(days=1)
    with pytest.raises(ValidationError):
        BookingCreate(
            property_id="some-id",
            check_in=tomorrow,
            check_out=tomorrow,
        )


def test_booking_accepts_checkout_after_checkin():
    tomorrow = date.today() + timedelta(days=1)
    booking = BookingCreate(
        property_id="some-id",
        check_in=tomorrow,
        check_out=tomorrow + timedelta(days=2),
    )
    assert (booking.check_out - booking.check_in).days == 2
