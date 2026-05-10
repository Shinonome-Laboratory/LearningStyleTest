"""
zh: 一键环境配置脚本
    运行后自动安装前后端依赖并初始化数据库
en: One-click environment setup script
    Installs frontend/backend dependencies and initializes the database
ja: ワンクリック環境セットアップスクリプト
    フロントエンド/バックエンドの依存関係をインストールし、データベースを初期化する

用法 / Usage / 使用方法:
    python setup.py
"""

import subprocess
import sys
import os

# zh: 脚本所在目录（code/）
# en: Directory of this script (code/)
# ja: このスクリプトのディレクトリ（code/）
BASE = os.path.dirname(os.path.abspath(__file__))

def run(cmd, cwd, label):
    print(f"\n{'='*50}")
    print(f"[zh] {label}")
    print(f"{'='*50}")
    result = subprocess.run(cmd, cwd=cwd, shell=True)
    if result.returncode != 0:
        print(f"\n[ERROR] 步骤失败 / Step failed / ステップ失敗: {label}")
        sys.exit(1)

def check_node():
    # zh: 检查 Node.js 是否安装
    # en: Check if Node.js is installed
    # ja: Node.js がインストールされているか確認する
    result = subprocess.run("node --version", shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print("[ERROR] 未检测到 Node.js / Node.js not found / Node.js が見つかりません")
        print("        请安装 Node.js 18+ / Please install Node.js 18+ / Node.js 18+ をインストールしてください")
        print("        https://nodejs.org")
        sys.exit(1)
    print(f"[OK] Node.js {result.stdout.strip()}")

def main():
    print("\n" + "="*50)
    print("  LearningStyleTest — Setup")
    print("="*50)

    check_node()

    # zh: 安装后端依赖
    # en: Install backend dependencies
    # ja: バックエンドの依存関係をインストールする
    run("npm install", os.path.join(BASE, "backend"),
        "安装后端依赖 / Installing backend dependencies / バックエンド依存関係のインストール")

    # zh: 运行数据库迁移和种子数据
    # en: Run database migrations and seed data
    # ja: データベースのマイグレーションとシードデータを実行する
    run("npm run setup", os.path.join(BASE, "backend"),
        "初始化数据库 / Initializing database / データベースの初期化")

    # zh: 安装前端依赖
    # en: Install frontend dependencies
    # ja: フロントエンドの依存関係をインストールする
    run("npm install", os.path.join(BASE, "frontend"),
        "安装前端依赖 / Installing frontend dependencies / フロントエンド依存関係のインストール")

    print("\n" + "="*50)
    print("[zh] ✅ 环境配置完成！运行 python start.py 启动服务")
    print("[en] ✅ Setup complete! Run python start.py to start")
    print("[ja] ✅ セットアップ完了！python start.py で起動してください")
    print("="*50 + "\n")

    print("[zh] 默认管理员密码: admin123 （请登录后立即修改）")
    print("[en] Default admin password: admin123 (please change after login)")
    print("[ja] デフォルト管理者パスワード: admin123（ログイン後すぐに変更してください）\n")

if __name__ == "__main__":
    main()
