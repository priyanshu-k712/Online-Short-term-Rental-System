from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .database import client, initialize_database
from .routers import auth, bookings, properties


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield
    client.close()


app = FastAPI(
    title="Online Short-Term Property Rental System API",
    description="A small college project API for guests, hosts, properties and bookings.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(properties.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")


@app.get("/api/health", tags=["Health"])
def health_check():
    try:
        client.admin.command("ping")
    except Exception:
        raise HTTPException(status_code=503, detail="MongoDB is not reachable.")
    return {"status": "ok", "database": "connected"}
