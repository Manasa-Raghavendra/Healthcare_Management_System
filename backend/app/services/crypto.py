# backend/app/services/crypto.py
import os
import base64
from typing import Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.fernet import Fernet
from app.config import settings

# ---------- DEK (Data Encryption Key) helpers ----------
def generate_dek() -> bytes:
    """
    Generate a random 256-bit DEK (returns raw bytes).
    """
    return AESGCM.generate_key(bit_length=256)

def encrypt_aes_gcm(plaintext: bytes, dek: bytes) -> bytes:
    """
    Encrypt plaintext with AES-GCM using provided DEK.
    Returns nonce (12 bytes) + ciphertext (bytes).
    """
    aesgcm = AESGCM(dek)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data=None)
    return nonce + ciphertext

def decrypt_aes_gcm(nonce_and_ciphertext: bytes, dek: bytes) -> bytes:
    """
    Decrypt bytes produced by encrypt_aes_gcm.
    """
    if len(nonce_and_ciphertext) < 13:
        raise ValueError("Invalid ciphertext (too short).")
    nonce = nonce_and_ciphertext[:12]
    ct = nonce_and_ciphertext[12:]
    aesgcm = AESGCM(dek)
    return aesgcm.decrypt(nonce, ct, associated_data=None)

# ---------- Wrap / Unwrap DEK using Fernet (demo only) ----------
def _get_fernet() -> Fernet:
    """
    Return a Fernet instance using MASTER_FERNET_KEY from settings.
    Raises if key missing.
    """
    key = getattr(settings, "MASTER_FERNET_KEY", None)
    if not key:
        raise RuntimeError("MASTER_FERNET_KEY is not set in settings/.env")
    # ensure bytes
    if isinstance(key, str):
        key_b = key.encode()
    else:
        key_b = key
    return Fernet(key_b)

def wrap_dek(dek: bytes) -> str:
    """
    Wrap (encrypt) a DEK using the master Fernet key.
    Returns a Fernet token string (utf-8).
    """
    f = _get_fernet()
    token = f.encrypt(dek)  # bytes
    # return text safe to store in DB
    return token.decode()

def unwrap_dek(wrapped_token: str) -> bytes:
    """
    Unwrap (decrypt) a wrapped DEK token (string) -> raw DEK bytes.
    """
    f = _get_fernet()
    return f.decrypt(wrapped_token.encode())

# ---------- Convenience: base64 helpers ----------
def encode_b64(data: bytes) -> str:
    return base64.b64encode(data).decode()

def decode_b64(data_b64: str) -> bytes:
    return base64.b64decode(data_b64.encode())
