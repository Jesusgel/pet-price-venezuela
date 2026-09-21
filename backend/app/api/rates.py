from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_active_admin, get_dolar_service, get_rate_service
from app.models.user import User
from app.schemas.exchange_rate import (
    ExchangeRateResponse,
    ExchangeRateUpdate,
    PaginatedExchangeRateResponse,
    RatePreviewResponse,
)
from app.services.dolar_service import DolarService
from app.services.rate_service import RateService

router = APIRouter()


@router.get("", response_model=ExchangeRateResponse)
@router.get("/", response_model=ExchangeRateResponse)
async def read_rate(dolar_service: DolarService = Depends(get_dolar_service)):
    """Obtiene la tasa de cambio vigente, sincronizándola automáticamente si es un nuevo día o está vencida (Público)."""
    return await dolar_service.get_or_sync_latest_rate()


@router.post("/update-rate", response_model=ExchangeRateResponse)
async def refresh_rate(
    dolar_service: DolarService = Depends(get_dolar_service),
    _admin: User = Depends(get_current_active_admin),
):
    """Fuerza la consulta a DolarAPI y actualiza la tasa en base de datos (Admin)."""
    return await dolar_service.update_exchange_rate(force=True)


@router.get("/history", response_model=PaginatedExchangeRateResponse)
async def read_rate_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    rate_service: RateService = Depends(get_rate_service),
):
    """Obtiene el historial paginado de tasas de cambio (Público)."""
    return await rate_service.get_all_rates(page, limit)


@router.post("/preview", response_model=RatePreviewResponse)
async def preview_rate_change(
    rate_in: ExchangeRateUpdate,
    rate_service: RateService = Depends(get_rate_service),
    _admin: User = Depends(get_current_active_admin),
):
    """Calcula desviación porcentual y simula el impacto en productos sin persistir cambios (Admin)."""
    return await rate_service.preview_rate_change(rate_in)


@router.put("/current", response_model=ExchangeRateResponse)
async def update_current_rate(
    rate_in: ExchangeRateUpdate,
    rate_service: RateService = Depends(get_rate_service),
    current_admin: User = Depends(get_current_active_admin),
):
    """Edita la tasa de cambio actual registrando auditoría del administrador (Admin)."""
    return await rate_service.update_current_rate(
        rate_in, changed_by_user_id=current_admin.id
    )
