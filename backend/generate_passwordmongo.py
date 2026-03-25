from app.core.security import hash_password

def main():
    plain_password = "MyStrongPass@2026"   # choose a strong password
    hashed = hash_password(plain_password)
    print(f"Plain: {plain_password}")
    print(f"Hashed: {hashed}")

if __name__ == "__main__":
    main()