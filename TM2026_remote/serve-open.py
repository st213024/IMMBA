"""
本機預覽：用 Python 內建 HTTP 伺服器，並自動開啟瀏覽器。
在 TM2026_remote 資料夾執行： py serve-open.py
"""
from __future__ import annotations

import http.server
import os
import socketserver
import threading
import time
import webbrowser

PORT = 8765
HOST = "127.0.0.1"
ROOT = os.path.dirname(os.path.abspath(__file__))


def _open_browser() -> None:
    time.sleep(0.8)
    url = f"http://{HOST}:{PORT}/index.html"
    print(f"Opening browser: {url}")
    webbrowser.open(url, new=1)


def main() -> None:
    os.chdir(ROOT)
    threading.Thread(target=_open_browser, daemon=True).start()
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer((HOST, PORT), handler) as httpd:
        print(f"Serving: {ROOT}")
        print(f"URL:     http://{HOST}:{PORT}/index.html")
        print("Press Ctrl+C to stop.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
