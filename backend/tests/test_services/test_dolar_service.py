import pytest
from datetime import datetime, timezone, date
from decimal import Decimal
from fastapi import HTTPException
import httpx

from app.models.exchange_rate import ExchangeRate
from app.repositories.rate_repository import ExchangeRateRepository
from app.services.dolar_service import DolarService

@pytest.fixture
def mock_dolar_response():
    return {
        "promedio": 38.5,
        "fechaActualizacion": "2024-04-15T00:00:00-04:00"
    }

@pytest.fixture
def rate_repo(db_session):
    return ExchangeRateRepository(db_session)

@pytest.fixture
def dolar_service(rate_repo):
    return DolarService(rate_repo)

@pytest.mark.asyncio
async def test_fetch_current_rate_success(mocker, dolar_service, mock_dolar_response):
    # Mock httpx response
    mock_response = mocker.Mock()
    mock_response.json.return_value = mock_dolar_response
    mock_response.raise_for_status.return_value = None
    
    mock_get = mocker.patch("httpx.AsyncClient.get", return_value=mock_response)
    
    rate, update_date = await dolar_service.fetch_current_rate()
    
    assert rate == Decimal("38.5")
    assert isinstance(update_date, datetime)
    mock_get.assert_called_once()

@pytest.mark.asyncio
async def test_fetch_current_rate_failure(mocker, dolar_service):
    # Mock httpx to raise taking an exception
    mocker.patch("httpx.AsyncClient.get", side_effect=httpx.HTTPError("API error"))
    
    with pytest.raises(HTTPException) as exc:
        await dolar_service.fetch_current_rate()
        
    assert exc.value.status_code == 503

@pytest.mark.asyncio
async def test_update_exchange_rate_creates_new(mocker, dolar_service):
    # Mock the internal fetcher so we don't need network
    mock_date = datetime(2024, 4, 15, tzinfo=timezone.utc)
    mock_rate = Decimal("39.0")
    mocker.patch.object(dolar_service, "fetch_current_rate", return_value=(mock_rate, mock_date))
    
    # Act: save current rate
    rate_record = await dolar_service.update_exchange_rate()
    
    assert rate_record is not None
    assert rate_record.rate == mock_rate
    assert rate_record.rate_date == mock_date.date()
    
    # Verify it got saved by getting the latest rate directly
    latest = await dolar_service.get_latest_rate()
    assert latest.id == rate_record.id

@pytest.mark.asyncio
async def test_update_exchange_rate_avoids_duplicates(mocker, dolar_service, db_session):
    # Seed db with today's rate
    repo = ExchangeRateRepository(db_session)
    existing_rate = await repo.create(
        rate=Decimal("38.5"),
        rate_date=date(2024, 4, 15),
        source="dolarapi"
    )
    
    # Setup mock to return the same values we just saved
    mock_date = datetime(2024, 4, 15, tzinfo=timezone.utc)
    mocker.patch.object(dolar_service, "fetch_current_rate", return_value=(Decimal("38.5"), mock_date))
    
    # Act
    rate_record = await dolar_service.update_exchange_rate()
    
    # Ensure it just returned the existing one
    assert rate_record.id == existing_rate.id
