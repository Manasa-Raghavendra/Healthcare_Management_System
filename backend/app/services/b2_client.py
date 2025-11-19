# app/services/b2_client.py
import logging
from typing import Optional
import boto3
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError
from ..config import settings

logger = logging.getLogger(__name__)

# Create a boto3 S3 client configured for Backblaze B2 (S3-compatible)
def _create_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.B2_ENDPOINT,
        aws_access_key_id=settings.B2_KEY_ID,
        aws_secret_access_key=settings.B2_APPLICATION_KEY,
        config=Config(signature_version="s3v4"),
        region_name=None,  # Backblaze doesn't require AWS region semantics
    )

# Public client instance (lazy)
_s3 = None
def get_s3_client():
    global _s3
    if _s3 is None:
        _s3 = _create_s3_client()
    return _s3


# --------------- Upload / Download ---------------

def upload_bytes(bucket: str, key: str, data: bytes, content_type: Optional[str] = None) -> None:
    """
    Upload raw bytes to the specified bucket/key.
    Raises an exception on failure.
    """
    s3 = get_s3_client()
    extra_args = {}
    if content_type:
        extra_args["ContentType"] = content_type
    try:
        s3.put_object(Bucket=bucket, Key=key, Body=data, **extra_args)
    except (BotoCoreError, ClientError) as e:
        logger.exception("Failed to upload object to B2: %s", e)
        raise


def download_bytes(bucket: str, key: str) -> bytes:
    """
    Download entire object content as bytes.
    Raises an exception on failure.
    """
    s3 = get_s3_client()
    try:
        resp = s3.get_object(Bucket=bucket, Key=key)
        body = resp["Body"].read()
        return body
    except (BotoCoreError, ClientError) as e:
        logger.exception("Failed to download object from B2: %s", e)
        raise


# --------------- Presigned URLs (optional) ---------------

def generate_presigned_get(bucket: str, key: str, expires_in: int = 3600) -> str:
    """
    Generate a presigned GET URL for reading the object directly from B2.
    """
    s3 = get_s3_client()
    try:
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=expires_in,
        )
        return url
    except (BotoCoreError, ClientError) as e:
        logger.exception("Failed to generate presigned GET URL: %s", e)
        raise


def generate_presigned_put(bucket: str, key: str, expires_in: int = 3600, content_type: Optional[str] = None) -> str:
    """
    Generate a presigned PUT URL that allows a client to upload directly to B2.
    Note: when using presigned PUT, client must send the file bytes with the correct Content-Type (if provided).
    """
    s3 = get_s3_client()
    params = {"Bucket": bucket, "Key": key}
    if content_type:
        params["ContentType"] = content_type

    try:
        url = s3.generate_presigned_url(
            "put_object",
            Params=params,
            ExpiresIn=expires_in,
        )
        return url
    except (BotoCoreError, ClientError) as e:
        logger.exception("Failed to generate presigned PUT URL: %s", e)
        raise
