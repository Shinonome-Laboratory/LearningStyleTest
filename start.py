"""
zh: 一键启动脚本
    同时启动后端（Node.js）和前端（Vite）服务，并自动打开浏览器
en: One-click start script
    Starts backend (Node.js) and frontend (Vite) simultaneously, then opens browser
ja: ワンクリック起動スクリプト
    バックエンド（Node.js）とフロントエンド（Vite）を同時に起動し、ブラウザを自動で開く

用法 / Usage / 使用方法:
    python start.py
"""

import subprocess
import sys
import os
import time
import webbrowser
import threading
import signal

# zh: Windows GBK 控制台无法打印部分 Unicode 字符，强制 stdout/stderr 使用 UTF-8
# en: Windows GBK consoles cannot print some Unicode chars — force UTF-8 output
# ja: Windows の GBK コンソールは一部の Unicode を出力できないため UTF-8 を強制する
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

BASE = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE, "backend")
FRONTEND_DIR = os.path.join(BASE, "frontend")

# zh: 存储子进程引用，用于退出时清理
# en: Store subprocess references for cleanup on exit
# ja: 終了時のクリーンアップのためにサブプロセス参照を格納する
procs = []

def check_setup():
    # zh: 检查数据库文件是否存在，提示用户先运行 setup.py
    # en: Check if database exists, prompt user to run setup.py first
    # ja: データベースファイルが存在するか確認し、先に setup.py を実行するよう促す
    db_path = os.path.join(BACKEND_DIR, "db", "lst.sqlite3")
    if not os.path.exists(db_path):
        print("[zh] 未检测到数据库，请先运行: python setup.py")
        print("[en] Database not found. Please run: python setup.py first")
        print("[ja] データベースが見つかりません。先に python setup.py を実行してください")
        sys.exit(1)

def start_backend():
    # zh: 启动 Node.js 后端服务
    # en: Start Node.js backend server
    # ja: Node.js バックエンドサーバーを起動する
    print("[zh] 启动后端服务 (port 3000)...")
    print("[en] Starting backend (port 3000)...")
    print("[ja] バックエンドを起動中 (port 3000)...")
    p = subprocess.Popen(
        "node index.js",
        cwd=BACKEND_DIR,
        shell=True,
        stdout=sys.stdout,
        stderr=sys.stderr
    )
    procs.append(p)
    return p

def start_frontend():
    # zh: 启动 Vite 前端开发服务
    # en: Start Vite frontend dev server
    # ja: Vite フロントエンド開発サーバーを起動する
    print("[zh] 启动前端服务 (port 5173)...")
    print("[en] Starting frontend (port 5173)...")
    print("[ja] フロントエンドを起動中 (port 5173)...")
    p = subprocess.Popen(
        "npm run dev",
        cwd=FRONTEND_DIR,
        shell=True,
        stdout=sys.stdout,
        stderr=sys.stderr
    )
    procs.append(p)
    return p

def open_browser():
    # zh: 等待服务就绪后打开浏览器
    # en: Wait for service ready then open browser
    # ja: サービスの準備ができるまで待ってからブラウザを開く
    time.sleep(4)
    url = "http://localhost:5173/test"
    print(f"\n[zh] 正在打开浏览器: {url}")
    print(f"[en] Opening browser: {url}")
    print(f"[ja] ブラウザを開いています: {url}")
    webbrowser.open(url)

def cleanup(sig=None, frame=None):
    # zh: 捕获 Ctrl+C，优雅关闭所有子进程
    # en: Catch Ctrl+C and gracefully stop all subprocesses
    # ja: Ctrl+C をキャッチし、すべてのサブプロセスを正常に停止する
    print("\n\n[zh] 正在停止服务...")
    print("[en] Stopping services...")
    print("[ja] サービスを停止中...")
    for p in procs:
        try:
            p.terminate()
        except Exception:
            pass
    sys.exit(0)

def main():
    print("\n" + "="*50)
    print("  LearningStyleTest — Starting")
    print("="*50)

    check_setup()

    signal.signal(signal.SIGINT, cleanup)

    start_backend()
    time.sleep(1)
    start_frontend()

    # zh: 后台线程打开浏览器
    # en: Open browser in background thread
    # ja: バックグラウンドスレッドでブラウザを開く
    threading.Thread(target=open_browser, daemon=True).start()

    print("\n" + "="*50)
    print("[zh] 服务已启动，按 Ctrl+C 停止")
    print("[en] Services running. Press Ctrl+C to stop")
    print("[ja] サービス起動中。Ctrl+C で停止してください")
    print("="*50)
    print(f"  被测者端 / Test:  http://localhost:5173/test")
    print(f"  管理控制台 / Admin: http://localhost:5173/admin")
    print("="*50 + "\n")

    # zh: 等待子进程结束
    # en: Wait for subprocesses
    # ja: サブプロセスの終了を待つ
    try:
        for p in procs:
            p.wait()
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
