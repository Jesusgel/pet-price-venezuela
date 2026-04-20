from fastapi import APIRouter, Depends, HTTPException

from app.schemas.exchange_rate import ExchangeRateResponse
from app.services.dolar_service import DolarService
from app.api.deps import get_dolar_service

router = APIRouter()

@router.get("/", response_model=ExchangeRateResponse)
async def read_rate(dolar_service: DolarService = Depends(get_dolar_service)):
    """Get the most recently fetched exchange rate."""
    latest = await dolar_service.get_latest_rate()
    if not latest:
        raise HTTPException(status_code=404, detail="No rate found in DB")
    return latest

@router.post("/update-rate", response_model=ExchangeRateResponse)
async def refresh_rate(dolar_service: DolarService = Depends(get_dolar_service)):
    """Fetch from DolarAPI and update DB if needed."""
    return await dolar_service.update_exchange_rate()
