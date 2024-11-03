from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class RunPredictionRequest(BaseModel):
    image: str = Field(
        ...,
        alias="model_image",
        description="Image URL or base64 with prefix (e.g., data:image/jpg;base64,...)")
    garment_image: str = Field(
        ..., 
        description="Image URL or base64 with prefix (e.g., data:image/jpg;base64,...)")
    category: str = Field(
        ...,
          description="'tops' | 'bottoms' | 'one-pieces'")
    nsfw_filter: Optional[bool] = Field(
        True, 
        description="Runs NSFW content filter on inputs.")
    cover_feet: Optional[bool] = Field(
        False, 
        description="Allows long garments to cover the feet/shoes or change their appearance.")
    adjust_hands: Optional[bool] = Field(
        False, 
        description="Allow changing the appearance of the model’s hands.")
    restore_background: Optional[bool] = Field(
        False, 
        description="Preserve the original background.")
    restore_clothes: Optional[bool] = Field(
        False, 
        description="Preserve the appearance of clothes that weren’t swapped.")
    flat_lay: Optional[bool] = Field(
        False, 
        description="Adjusts for flat lay and ghost mannequin photography.")
    remove_garment_background: Optional[bool] = Field(
        False, 
        description="Removes the background of the garment image.")
    long_top: Optional[bool] = Field(
        False, 
        description="Adjusts for long tops such as tunics, coats, etc.")
    guidance_scale: Optional[float] = Field(
        2.0, 
        ge=1.5, 
        le=5.0, 
        description="Step size for timesteps. Range: 1.5-5")
    timesteps: Optional[int] = Field(
        50, 
        ge=10, 
        le=50, 
        description="Number of steps the diffusion model will take.")
    seed: Optional[int] = Field(
        42, 
        description="Sets random operations to a fixed state.")
    num_samples: Optional[int] = Field(
        1, 
        ge=1, 
        le=4, 
        description="Number of images to generate in a single run.")

    class Config:
        populate_by_name = True

class RunPredictionResponse(BaseModel):
    id: str
    error: Optional[Dict[str, str]] = None

class StatusResponse(BaseModel):
    id: str
    status: str  # starting | in_queue | processing | completed | failed | canceled
    output: Optional[List[str]] = None    
    error: Optional[Dict[str, str]] = None  

class CancelResponse(BaseModel):
    id: str
    status: str  # canceled

class ErrorDetail(BaseModel):
    name: str  # PipelineError | RequestError | ImageLoadError | NSFWError | PoseError | InputValidationError
    message: str

class ErrorResponse(BaseModel):
    error: ErrorDetail
