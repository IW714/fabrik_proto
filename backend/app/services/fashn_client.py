import httpx
from app.models.fashn_models import (
    RunPredictionRequest,
    RunPredictionResponse,
    StatusResponse,
    CancelResponse
)
from dotenv import load_dotenv
from fastapi.encoders import jsonable_encoder
import os

load_dotenv()

FASHN_BASE_URL = os.getenv("FASHN_BASE_URL", "https://api.fashn.ai/v1/")
FASHN_API_KEY = os.getenv("FASHN_API_KEY")

class FashnClient: 
    def __init__(self, api_key: str = FASHN_API_KEY, base_url: str = FASHN_BASE_URL):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        self.client = httpx.AsyncClient(headers=self.headers)

    async def run_prediction(self, payload: RunPredictionRequest) -> RunPredictionResponse:
        url = f"{self.base_url}run"
        json_payload = jsonable_encoder(payload, by_alias=True)
        response = await self.client.post(url, json=json_payload)
        response.raise_for_status()
        return RunPredictionResponse(**response.json())

    async def get_status(self, id: str) -> StatusResponse:
        url = f"{self.base_url}status/{id}"
        response = await self.client.get(url)
        response.raise_for_status()
        return StatusResponse(**response.json())

    async def cancel_prediction(self, id: str) -> CancelResponse:
        url = f"{self.base_url}cancel/{id}"
        response = await self.client.post(url)
        response.raise_for_status()
        return CancelResponse(**response.json())

    async def close(self):
        await self.client.aclose()

