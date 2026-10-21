import re
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo import DESCENDING

from ..database import db
from ..dependencies import get_current_user, require_role
from ..schemas import PropertyCreate, PropertyUpdate

router = APIRouter(prefix="/properties", tags=["Properties"])


def find_property_id(property_id: str) -> ObjectId:
    try:
        return ObjectId(property_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=404, detail="Property was not found.")


def serialize_property(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "host_id": document["host_id"],
        "host_name": document["host_name"],
        "title": document["title"],
        "description": document["description"],
        "location": document["location"],
        "price_per_night": document["price_per_night"],
        "amenities": document.get("amenities", []),
        "image_url": document.get("image_url", ""),
        "created_at": document["created_at"],
        "updated_at": document.get("updated_at"),
    }


@router.get("")
def list_properties(
    location: str | None = Query(default=None, max_length=100),
    max_price: float | None = Query(default=None, gt=0),
):
    query: dict = {}
    if location and location.strip():
        query["location"] = {"$regex": re.escape(location.strip()), "$options": "i"}
    if max_price is not None:
        query["price_per_night"] = {"$lte": max_price}

    documents = db.properties.find(query).sort("created_at", DESCENDING)
    return [serialize_property(document) for document in documents]


@router.get("/mine")
def list_my_properties(current_user: dict = Depends(require_role("host"))):
    documents = db.properties.find({"host_id": current_user["id"]}).sort(
        "created_at", DESCENDING
    )
    return [serialize_property(document) for document in documents]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_property(
    payload: PropertyCreate,
    current_user: dict = Depends(require_role("host")),
):
    now = datetime.now(timezone.utc).isoformat()
    document = payload.model_dump()
    document.update(
        {
            "host_id": current_user["id"],
            "host_name": current_user["name"],
            "created_at": now,
            "updated_at": now,
        }
    )
    result = db.properties.insert_one(document)
    created = db.properties.find_one({"_id": result.inserted_id})
    return serialize_property(created)


@router.get("/{property_id}")
def get_property(property_id: str):
    document = db.properties.find_one({"_id": find_property_id(property_id)})
    if document is None:
        raise HTTPException(status_code=404, detail="Property was not found.")
    return serialize_property(document)


@router.put("/{property_id}")
def update_property(
    property_id: str,
    payload: PropertyUpdate,
    current_user: dict = Depends(require_role("host")),
):
    object_id = find_property_id(property_id)
    existing = db.properties.find_one({"_id": object_id})
    if existing is None:
        raise HTTPException(status_code=404, detail="Property was not found.")
    if existing["host_id"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only edit properties that you created.",
        )

    updated_values = payload.model_dump()
    updated_values["updated_at"] = datetime.now(timezone.utc).isoformat()
    db.properties.update_one({"_id": object_id}, {"$set": updated_values})
    return serialize_property(db.properties.find_one({"_id": object_id}))


@router.delete("/{property_id}")
def delete_property(
    property_id: str,
    current_user: dict = Depends(require_role("host")),
):
    object_id = find_property_id(property_id)
    existing = db.properties.find_one({"_id": object_id})
    if existing is None:
        raise HTTPException(status_code=404, detail="Property was not found.")
    if existing["host_id"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only delete properties that you created.",
        )

    db.properties.delete_one({"_id": object_id})
    return {"message": "Property deleted successfully."}
