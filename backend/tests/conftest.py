"""
pytest configuration and shared fixtures.
Uses an in-memory SQLite database for test isolation.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import User
from app.core.security import hash_password, create_access_token

# ── In-memory test database (isolated, never touches real DB) ─────────────────
SQLALCHEMY_TEST_URL = "sqlite://"

test_engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test and drop after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    """HTTP test client."""
    return TestClient(app)


@pytest.fixture
def db():
    """Database session for direct queries in tests."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_recruiter(db):
    """Create a test recruiter user."""
    user = User(
        email="recruiter@test.com",
        hashed_password=hash_password("TestPass1"),
        full_name="Test Recruiter",
        role="recruiter",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin(db):
    """Create a test admin user."""
    user = User(
        email="admin@test.com",
        hashed_password=hash_password("AdminPass1"),
        full_name="Test Admin",
        role="admin",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def recruiter_token(test_recruiter):
    """JWT access token for the test recruiter."""
    return create_access_token({"sub": test_recruiter.email, "role": "recruiter", "user_id": test_recruiter.id})


@pytest.fixture
def admin_token(test_admin):
    """JWT access token for the test admin."""
    return create_access_token({"sub": test_admin.email, "role": "admin", "user_id": test_admin.id})


@pytest.fixture
def recruiter_headers(recruiter_token):
    return {"Authorization": f"Bearer {recruiter_token}"}


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}
