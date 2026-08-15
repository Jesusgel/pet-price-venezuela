from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.exchange_rate import (
    ExchangeRateResponse,
    ExchangeRateUpdate,
    PaginatedExchangeRateResponse,
)
from app.services.dolar_service import DolarService
from app.services.rate_service import RateService
from app.api.deps import get_dolar_service, get_rate_service

router = APIRouter()


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


@router.get("/history", response_model=PaginatedExchangeRateResponse)
async def read_rate_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    rate_service: RateService = Depends(get_rate_service),
):
    """Obtiene el historial paginado de tasas de cambio."""
    return await rate_service.get_all_rates(page, limit)


@router.put("/current", response_model=ExchangeRateResponse)
async def update_current_rate(
    rate_in: ExchangeRateUpdate,
    rate_service: RateService = Depends(get_rate_service),
):
    """Edita la tasa de cambio actual (la más reciente)."""
    return await rate_service.update_current_rate(rate_in)
