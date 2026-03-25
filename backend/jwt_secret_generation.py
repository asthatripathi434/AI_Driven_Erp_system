import secrets

# 32-byte hex string (256 bits)
secret_key = secrets.token_hex(32)
print(secret_key)