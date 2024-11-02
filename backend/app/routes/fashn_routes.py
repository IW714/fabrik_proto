from fastapi import APIRouter, Depends, HTTPException, status
from app.models.fashn_models import (
    RunPredictionRequest,
    RunPredictionResponse,
    StatusResponse,
    CancelResponse,
    ErrorResponse
)
from app.services.fashn_client import FashnClient
import httpx

router = APIRouter(
    prefix="/fashn",
    tags=["FASHN API"],
    responses={400: {"model": "ErrorResponse"}, 500: {"model": "ErrorResponse"}}
)

async def get_fashn_client():
    return FashnClient()

@router.post("/run", response_model=RunPredictionResponse)
async def run_prediction(
    payload: RunPredictionRequest,
    client: FashnClient = Depends(get_fashn_client)
):
    try:
        prediction = await client.run_prediction(payload)
        return prediction
    except httpx.HTTPStatusError as e:
        error_data = e.response.json().get("error", {})
        raise HTTPException(
            status_code=e.response.status_code,
            detail=error_data
        )
    except Exception as e: 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/status/{id}", response_model=StatusResponse)
async def get_status(id: str, client: FashnClient = Depends(get_fashn_client)):
    try:
        status = await client.get_status(id)
        return status
    except httpx.HTTPStatusError as e:
        error_data = e.response.json().get("error", {})
        raise HTTPException(
            status_code=e.response.status_code,
            detail=error_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
@router.get("/cancel/{prediction_id}", response_model=CancelResponse)
async def cancel_prediction(
    prediction_id: str,
    client: FashnClient = Depends(get_fashn_client)
):
    try:
        cancel_response = await client.cancel_prediction(prediction_id)
        return cancel_response
    except httpx.HTTPStatusError as exc:
        error_data = exc.response.json().get("error", {})
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=error_data
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc)
        )