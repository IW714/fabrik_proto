from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .services.auth import verify_token
from app.routes import fashn_routes
from app.db import db
from app.models import ImageModel

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

def get_database():
    return db

app.include_router(fashn_routes.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/save-image", response_description="Save an image", response_model=ImageModel)
async def save_image(image: ImageModel, db=Depends(get_database)):
    saved_image = image.dict(by_alias=True)
    result = await db['saved_images'].insert_one(saved_image)
    saved_image['_id'] = result.inserted_id
    return saved_image

@app.get("/saved-images", response_description="List all saved images", response_model=list[ImageModel])
async def get_saved_images(db=Depends(get_database)):
    saved_images = await db['saved_images'].find().to_list(1000)
    return saved_images



# Ex of protected route
# @app.get("/protected")
# def protected_route(user=Depends(verify_token)):
#     return {"message": f"Hello, {user['uid']}"}
