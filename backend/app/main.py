from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .services.auth import verify_token
from app.routes import fashn_routes

app = FastAPI(
    title="Fabrik - FASHN API",
    description="API for interacting with FASHN AI service."
)

# Configure CROS
origins = [
    "http://localhost:5173", # React frontend
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specified origins
    allow_credentials=True,
    allow_methods=["*"],    # Allow all HTTP methods
    allow_headers=["*"],    # Allow all HTTP headers
)

app.include_router(fashn_routes.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}

# Ex of protected route
# @app.get("/protected")
# def protected_route(user=Depends(verify_token)):
#     return {"message": f"Hello, {user['uid']}"}
