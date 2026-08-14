"""
Authentication router: Register, Login, Refresh Token, Profile, Logout.
Uses real JWT (python-jose) and bcrypt password hashing.
"""
from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional

from app.database import get_db
from app.models import User, AuditLog
from app.schemas import (
    UserRegisterRequest, UserLoginRequest, TokenResponse,
    RefreshTokenRequest, UserPublic, UserUpdateRequest
)
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _log_action(db: Session, user_id: Optional[int], action: str, request: Request, details: dict = None):
    """Write an audit log entry."""
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource="/api/auth",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "")[:500],
            status_code=200,
            details=details,
        )
        db.add(log)
        db.commit()
    except Exception:
        pass  # Audit logging should never break the main flow




@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, request: Request, db: Session = Depends(get_db)):
    """
    Register a new user account.
    - Validates email uniqueness
    - Hashes password with bcrypt
    - Returns user profile (no password)
    """
    # Check for existing account
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Create user with bcrypt hash
    new_user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        role=req.role,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    _log_action(db, new_user.id, "USER_REGISTERED", request, {"role": req.role})
    return new_user


@router.post("/login", response_model=TokenResponse)
def login_user(req: UserLoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Login with email and password.
    Returns JWT access token + refresh token.
    """
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact administrator.",
        )

    token_data = {"sub": user.email, "role": user.role, "user_id": user.id}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    _log_action(db, user.id, "USER_LOGIN", request)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserPublic.model_validate(user),
    )


@router.post("/login-form", include_in_schema=False)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None,
    db: Session = Depends(get_db),
):
    """OAuth2 password form endpoint for Swagger UI 'Authorize' button."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token_data = {"sub": user.email, "role": user.role, "user_id": user.id}
    return {"access_token": create_access_token(token_data), "token_type": "bearer"}


@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token using a valid refresh token.
    Issues a new access token + refresh token pair.
    """
    payload = decode_token(req.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type. Provide a refresh token.",
        )
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    token_data = {"sub": user.email, "role": user.role, "user_id": user.id}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=UserPublic.model_validate(user),
    )


@router.get("/me", response_model=UserPublic)
def get_current_profile(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user


@router.put("/me", response_model=UserPublic)
def update_profile(
    req: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the authenticated user's profile and/or password."""
    if req.full_name:
        current_user.full_name = req.full_name

    if req.new_password:
        if not req.current_password:
            raise HTTPException(status_code=400, detail="Current password is required to set a new password.")
        if not verify_password(req.current_password, current_user.hashed_password):
            raise HTTPException(status_code=401, detail="Current password is incorrect.")
        current_user.hashed_password = hash_password(req.new_password)

    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Logout endpoint — client should delete the token on their side.
    Server-side: logs the logout action.
    """
    _log_action(db, current_user.id, "USER_LOGOUT", request)
    return {"message": "Logged out successfully. Please clear your local token."}
