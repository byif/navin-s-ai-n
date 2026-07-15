import sys

import uvicorn


def main() -> None:
    command = sys.argv[1] if len(sys.argv) > 1 else "runserver"

    if command != "runserver":
        print("Supported command: python manage.py runserver [host:port]")
        sys.exit(1)

    address = sys.argv[2] if len(sys.argv) > 2 else "127.0.0.1:8000"
    host, _, port = address.partition(":")

    uvicorn.run("backend.app:app", host=host or "127.0.0.1", port=int(port or 8000), reload=False)


if __name__ == "__main__":
    main()
