from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.schemas.exchange_rate import ExchangeRateResponse
from app.services.dolar_service import get_latest_rate, update_exchange_rate

router = APIRouter()

@router.get("/", response_model=ExchangeRateResponse)
async def read_rate(session: AsyncSession = Depends(get_session)):
    """Get the most recently fetched exchange rate."""
    latest = await get_latest_rate(session)
    if not latest:
        raise HTTPException(status_code=404, detail="No rate found in DB")
    return latest

@router.post("/update-rate", response_model=ExchangeRateResponse)
async def refresh_rate(session: AsyncSession = Depends(get_session)):
    """Fetch from DolarAPI and update DB if needed."""
    return await update_exchange_rate(session)
