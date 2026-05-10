# LearningStyleTest · 学习风格测评系统

---

## 中文

### 项目简介

基于 **Kolb 学习风格理论** 的在线测评工具，适用于教学研究场景。

- **被测者端**：填写基本信息 → 完成强迫选择问卷 → 即时查看学习风格结果与坐标图
- **研究者端**：管理题目与理论、查看全体学员散点分布、导出原始数据（JSON / CSV / XLSX）
- 支持 **中文 / English / 日本語** 三语言界面
- 数据持久化：答卷结果同步写入 SQLite 数据库与 `Userdata/respondents.csv`，重启服务后自动恢复

### 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 · Vite · Element Plus · ECharts · vue-i18n |
| 后端 | Node.js · Express · Knex.js · SQLite |
| 脚本 | Python 3（环境配置 & 一键启动） |

### 环境要求

- **Node.js 18+**（[下载地址](https://nodejs.org)）
- **Python 3.8+**（[下载地址](https://python.org)）

### 一键配置环境（首次使用）

```bash
python setup.py
```

脚本将自动完成：后端依赖安装 → 数据库初始化（迁移 + 种子数据）→ 前端依赖安装。

### 一键启动

```bash
python start.py
```

服务启动后将自动打开浏览器，也可手动访问：

| 页面 | 地址 |
|---|---|
| 被测者测评入口 | http://localhost:5173/test |
| 研究者管理控制台 | http://localhost:5173/admin |

按 `Ctrl+C` 停止所有服务。

### 管理员账号

| 项目 | 值 |
|---|---|
| 初始密码 | `admin123` |
| 修改入口 | 管理控制台 → 设置 → 修改密码 |

> **请在首次登录后立即修改密码。**

### 目录结构

```
code/
├── setup.py          # 一键环境配置
├── start.py          # 一键启动
├── backend/
│   ├── index.js      # Express 入口
│   ├── routes/       # API 路由
│   ├── db/           # 迁移 & 种子数据
│   ├── Userdata/     # CSV 持久化备份
│   └── scripts/      # 辅助脚本
└── frontend/
    ├── src/
    │   ├── views/    # 页面组件
    │   ├── components/
    │   ├── stores/   # Pinia 状态管理
    │   └── i18n/     # 三语言翻译文件
    └── vite.config.js
```

---

## English

### Overview

An online learning style assessment tool based on **Kolb's Experiential Learning Theory**, designed for educational research.

- **Test-taker side**: Fill in basic info → Complete forced-choice questionnaire → View results & coordinate chart instantly
- **Researcher side**: Manage questions & theories, view scatter distribution of all respondents, export raw data (JSON / CSV / XLSX)
- Trilingual interface: **中文 / English / 日本語**
- Data persistence: responses are written to both SQLite and `Userdata/respondents.csv`; data is automatically restored on server restart

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 · Vite · Element Plus · ECharts · vue-i18n |
| Backend | Node.js · Express · Knex.js · SQLite |
| Scripts | Python 3 (setup & one-click launch) |

### Requirements

- **Node.js 18+** ([download](https://nodejs.org))
- **Python 3.8+** ([download](https://python.org))

### One-click Setup (first time only)

```bash
python setup.py
```

This will automatically: install backend dependencies → initialize the database (migrations + seed data) → install frontend dependencies.

### One-click Start

```bash
python start.py
```

The browser opens automatically. You can also navigate manually:

| Page | URL |
|---|---|
| Test-taker entry | http://localhost:5173/test |
| Researcher admin console | http://localhost:5173/admin |

Press `Ctrl+C` to stop all services.

### Admin Account

| Field | Value |
|---|---|
| Default password | `admin123` |
| Change password | Admin console → Settings → Change Password |

> **Please change the password immediately after your first login.**

### Directory Structure

```
code/
├── setup.py          # One-click environment setup
├── start.py          # One-click launch
├── backend/
│   ├── index.js      # Express entry point
│   ├── routes/       # API routes
│   ├── db/           # Migrations & seed data
│   ├── Userdata/     # CSV persistence backup
│   └── scripts/      # Utility scripts
└── frontend/
    ├── src/
    │   ├── views/    # Page components
    │   ├── components/
    │   ├── stores/   # Pinia state management
    │   └── i18n/     # Trilingual translation files
    └── vite.config.js
```

---

## 日本語

### プロジェクト概要

**コルブの経験学習理論**に基づいたオンライン学習スタイル診断ツールです。教育研究シーンでの活用を想定しています。

- **受験者側**：基本情報の入力 → 強制選択式アンケートへの回答 → 学習スタイルの結果と座標チャートをその場で確認
- **研究者側**：問題・理論の管理、全受験者の散布図確認、生データのエクスポート（JSON / CSV / XLSX）
- **中文 / English / 日本語** の3言語インターフェースに対応
- データ永続化：回答結果は SQLite データベースと `Userdata/respondents.csv` に同時書き込みされ、サーバー再起動後も自動復元されます

### 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Vue 3 · Vite · Element Plus · ECharts · vue-i18n |
| バックエンド | Node.js · Express · Knex.js · SQLite |
| スクリプト | Python 3（環境構築 & ワンクリック起動） |

### 動作環境

- **Node.js 18+**（[ダウンロード](https://nodejs.org)）
- **Python 3.8+**（[ダウンロード](https://python.org)）

### ワンクリック環境構築（初回のみ）

```bash
python setup.py
```

スクリプトが自動的に実行します：バックエンド依存関係のインストール → データベースの初期化（マイグレーション + シードデータ）→ フロントエンド依存関係のインストール。

### ワンクリック起動

```bash
python start.py
```

起動後、ブラウザが自動的に開きます。手動でアクセスする場合は以下のURLを使用してください：

| ページ | URL |
|---|---|
| 受験者テスト入口 | http://localhost:5173/test |
| 研究者管理コンソール | http://localhost:5173/admin |

`Ctrl+C` ですべてのサービスを停止できます。

### 管理者アカウント

| 項目 | 値 |
|---|---|
| 初期パスワード | `admin123` |
| 変更場所 | 管理コンソール → 設定 → パスワード変更 |

> **初回ログイン後、すぐにパスワードを変更してください。**

### ディレクトリ構成

```
code/
├── setup.py          # ワンクリック環境構築
├── start.py          # ワンクリック起動
├── backend/
│   ├── index.js      # Express エントリーポイント
│   ├── routes/       # API ルート
│   ├── db/           # マイグレーション & シードデータ
│   ├── Userdata/     # CSV 永続化バックアップ
│   └── scripts/      # ユーティリティスクリプト
└── frontend/
    ├── src/
    │   ├── views/    # ページコンポーネント
    │   ├── components/
    │   ├── stores/   # Pinia 状態管理
    │   └── i18n/     # 3言語翻訳ファイル
    └── vite.config.js
```
