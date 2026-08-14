"""
Authentication endpoint tests.
Tests: Registration, Login, JWT validation, Profile access, Token refresh.
"""
import pytest


class TestRegistration:
    def test_register_new_user_success(self, client):
        response = client.post("/api/auth/register", json={
            "email": "newuser@example.com",
            "password": "SecurePass1",
            "full_name": "New User",
            "role": "recruiter",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["role"] == "recruiter"
        assert "hashed_password" not in data  # Password must never be exposed

    def test_register_duplicate_email_fails(self, client):
        payload = {"email": "dup@example.com", "password": "SecurePass1", "full_name": "User", "role": "recruiter"}
        client.post("/api/auth/register", json=payload)
        response = client.post("/api/auth/register", json=payload)
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"].lower()

    def test_register_weak_password_fails(self, client):
        response = client.post("/api/auth/register", json={
            "email": "weak@example.com",
            "password": "password",  # No uppercase, no digit
            "full_name": "Weak User",
            "role": "recruiter",
        })
        assert response.status_code == 422  # Validation error

    def test_register_invalid_email_fails(self, client):
        response = client.post("/api/auth/register", json={
            "email": "not-an-email",
            "password": "SecurePass1",
            "full_name": "User",
            "role": "recruiter",
        })
        assert response.status_code == 422

    def test_register_invalid_role_fails(self, client):
        response = client.post("/api/auth/register", json={
            "email": "user@example.com",
            "password": "SecurePass1",
            "full_name": "User",
            "role": "superuser",  # Invalid role
        })
        assert response.status_code == 422


class TestLogin:
    def test_login_valid_credentials_returns_jwt(self, client):
        client.post("/api/auth/register", json={
            "email": "login@example.com", "password": "SecurePass1",
            "full_name": "Login User", "role": "recruiter",
        })
        response = client.post("/api/auth/login", json={
            "email": "login@example.com", "password": "SecurePass1",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "login@example.com"

    def test_login_wrong_password_fails(self, client):
        client.post("/api/auth/register", json={
            "email": "user2@example.com", "password": "SecurePass1",
            "full_name": "User", "role": "recruiter",
        })
        response = client.post("/api/auth/login", json={
            "email": "user2@example.com", "password": "WrongPass1",
        })
        assert response.status_code == 401

    def test_login_nonexistent_user_fails(self, client):
        response = client.post("/api/auth/login", json={
            "email": "ghost@example.com", "password": "SecurePass1",
        })
        assert response.status_code == 401


class TestProfile:
    def test_get_profile_authenticated(self, client, recruiter_headers):
        response = client.get("/api/auth/me", headers=recruiter_headers)
        assert response.status_code == 200
        assert response.json()["role"] == "recruiter"

    def test_get_profile_unauthenticated_fails(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_get_profile_invalid_token_fails(self, client):
        response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert response.status_code == 401


class TestTokenRefresh:
    def test_refresh_token_success(self, client):
        client.post("/api/auth/register", json={
            "email": "refresh@example.com", "password": "SecurePass1",
            "full_name": "Refresh User", "role": "recruiter",
        })
        login_resp = client.post("/api/auth/login", json={
            "email": "refresh@example.com", "password": "SecurePass1",
        })
        refresh_token = login_resp.json()["refresh_token"]
        response = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_refresh_with_access_token_fails(self, client, recruiter_token):
        # Access tokens cannot be used as refresh tokens
        response = client.post("/api/auth/refresh", json={"refresh_token": recruiter_token})
        assert response.status_code == 401


class TestLogout:
    def test_logout_authenticated(self, client, recruiter_headers):
        response = client.post("/api/auth/logout", headers=recruiter_headers)
        assert response.status_code == 200
        assert "message" in response.json()
