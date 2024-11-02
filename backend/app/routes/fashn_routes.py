# app/routes/fashn_routes.py

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
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
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

@router.get("/status/{prediction_id}", response_model=StatusResponse)
async def get_prediction_status(
    prediction_id: str,
    client: FashnClient = Depends(get_fashn_client)
):
    try:
        status_response = await client.get_status(prediction_id)
        return status_response
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            error_detail = {"name": "RequestError", "message": "Prediction ID not found."}
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_detail)
        else:
            error_detail = e.response.json().get("error", {"name": "ServerError", "message": "Internal Server Error"})
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_detail)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/cancel/{prediction_id}", response_model=CancelResponse)
async def cancel_prediction(
    prediction_id: str,
    client: FashnClient = Depends(get_fashn_client)
):
    try:
        cancel_response = await client.cancel_prediction(prediction_id)
        return cancel_response
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
