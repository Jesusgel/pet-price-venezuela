from fastapi import APIRouter, Depends, HTTPException

from app.schemas.exchange_rate import ExchangeRateResponse
from app.services.dolar_service import DolarService
from app.api.deps import get_dolar_service

router = APIRouter()

from datetime import datetime, timezone, timedelta

@router.get("/", response_model=ExchangeRateResponse)
async def read_rate(dolar_service: DolarService = Depends(get_dolar_service)):
    """Get the most recently fetched exchange rate, and update it if it's stale."""
    latest = await dolar_service.get_latest_rate()
    
    needs_update = False
    if not latest:
        needs_update = True
    else:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        # Check if the rate was fetched more than 2 hours ago
        if latest.fetched_at < now - timedelta(hours=2):
            needs_update = True
            
    if needs_update:
        try:
            return await dolar_service.update_exchange_rate()
        except Exception:
            if latest:
                return latest
            raise HTTPException(status_code=503, detail="Service Unavailable: cannot fetch current exchange rate.")
            
    return latest

@router.post("/update-rate", response_model=ExchangeRateResponse)
async def refresh_rate(dolar_service: DolarService = Depends(get_dolar_service)):
    """Fetch from DolarAPI and update DB if needed."""
    return await dolar_service.update_exchange_rate()
