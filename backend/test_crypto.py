# backend/test_crypto.py
from app.services import crypto

def run_test():
    print("Generating DEK...")
    dek = crypto.generate_dek()
    print("DEK (len):", len(dek))

    plaintext = b"Hello SecureCare - test payload"
    print("Plaintext:", plaintext)

    print("Encrypting...")
    ct = crypto.encrypt_aes_gcm(plaintext, dek)
    print("Encrypted bytes length:", len(ct))

    print("Wrapping DEK with MASTER_FERNET_KEY...")
    wrapped = crypto.wrap_dek(dek)
    print("Wrapped DEK token (preview):", wrapped[:40], "...")

    print("Unwrapping DEK...")
    dek2 = crypto.unwrap_dek(wrapped)
    assert dek2 == dek, "Unwrapped DEK does not match!"

    print("Decrypting...")
    pt = crypto.decrypt_aes_gcm(ct, dek2)
    print("Decrypted:", pt)

    if pt == plaintext:
        print("✅ Crypto test succeeded.")
    else:
        print("❌ Crypto test failed.")

if __name__ == "__main__":
    run_test()
