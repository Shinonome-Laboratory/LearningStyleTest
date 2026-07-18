<h1 align="center">🧭 LearningStyleTest <code>lst</code></h1>
<p align="center">
  <strong>Kolb learning style assessment for educational research</strong> — trilingual online questionnaire, instant scoring, and researcher analytics
</p>
<p align="center">
  <img src="https://img.shields.io/badge/node-18+-green" alt="Node.js">
  <img src="https://img.shields.io/badge/backend-Express_+_SQLite-teal" alt="Express">
  <img src="https://img.shields.io/badge/frontend-Vue_3_+_Vite-42b883" alt="Vue 3">
  <img src="https://img.shields.io/badge/charts-ECharts-c0392b" alt="ECharts">
  <img src="https://img.shields.io/badge/scripts-Python_3.8+-blue" alt="Python">
  <img src="https://img.shields.io/badge/i18n-zh_|_en_|_ja-f472b6" alt="Trilingual">
</p>

<details open>
<summary>🇨🇳 中文</summary>

<h1 align="center">🧭 学习风格测评系统 <code>lst</code></h1>
<p align="center">
  <strong>面向教学研究的 Kolb 学习风格在线测评工具</strong> — 三语问卷、即时计分、研究者数据分析一站式完成
</p>

---

## ✨ 核心功能

- **📝 被测者四步流程**：选择理论 → 填写基本信息 → 强迫选择问卷 → 即时查看学习风格结果与坐标图
- **🎯 Kolb 计分引擎**：四维度（CE / RO / AC / AE）累加计分，按 AC−CE、AE−RO 双轴定位四象限学习类型（聚合 / 同化 / 发散 / 适应）
- **📊 研究者控制台**：题目与理论管理、全体学员散点分布图（点击散点看个人详情）、类型人数统计
- **📤 三格式导出**：原始数据一键导出 JSON / CSV / XLSX，支持全量与单人导出
- **🧩 可配置信息字段**：被测者需要填写哪些信息（姓名、学号……）由管理端自由增删
- **🌐 三语国际化**：中文 / English / 日本語 界面秒切，题目、类型文案、结果建议全量三语
- **💾 双写持久化**：答卷同步写入 SQLite 与 `Userdata/respondents.csv`，数据库重建后自动从 CSV 回填
- **🔐 管理端鉴权**：bcrypt 密码哈希 + JWT（8 小时有效期），密码可在控制台修改

---

## 🏗️ 架构总览

### 测评流程

```
[选择理论] → [填写信息] → [逐题作答（可跳转）] → [提交]
                                                  │ POST /api/respondents
                                                  ▼
                             [Kolb 计分] → [SQLite + CSV 双写] → [结果页 + 坐标图]
```

### 实体关系

```
Theory ──1:N──▶ Question（题干 + 选项 + 维度分值）
   │
   └────1:N──▶ TypeContent（类型名称 / 描述 / 特点 / 建议）

Respondent ──N:1──▶ Theory（答案、得分、坐标、类型快照）
```

### 四象限判型

```
                    AC−CE ↑（抽象）
   同化型 Assimilating    │    聚合型 Converging
 ─────────────────────────┼─────────────────────────→ AE−RO（主动）
   发散型 Diverging       │    适应型 Accommodating
```

---

## 🚀 快速开始

### 环境要求

| 依赖 | 版本 | 用途 |
|---|---|---|
| [Node.js](https://nodejs.org) | 18+ | 前后端运行时 |
| [Python](https://python.org) | 3.8+ | 一键配置 / 启动脚本 |

### 一键配置 + 启动

```bash
# 1. 首次使用：安装依赖 + 初始化数据库
python setup.py

# 2. 启动前后端服务（自动打开浏览器）
python start.py

# 3. 停止：Ctrl+C
```

| 页面 | 地址 |
|---|---|
| 被测者测评入口 | http://localhost:5173/test |
| 研究者管理控制台 | http://localhost:5173/admin |

### 管理员账号

| 项目 | 值 |
|---|---|
| 初始密码 | `admin123` |
| 修改入口 | 管理控制台 → 设置 → 修改密码（至少 6 位） |

> ⚠️ 请在首次登录后立即修改密码。

---

## 🛠️ 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 · Vite（路由懒加载 + 分包构建） · Element Plus · ECharts · Pinia · vue-i18n |
| 后端 | Node.js · Express（统一 async 错误处理） · Knex.js · SQLite · JWT · bcrypt |
| 脚本 | Python 3（环境配置 & 一键启动，UTF-8 输出兼容 Windows 控制台） |

---

## 📡 API 端点（15）

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/health` | — | 健康检查 |
| GET | `/api/questions?theory_id=` | — | 题目列表（按序号） |
| POST | `/api/questions` | 🔒 | 新增题目（自动生成字符串主键） |
| PUT | `/api/questions/:id` | 🔒 | 更新题目 |
| DELETE | `/api/questions/:id` | 🔒 | 删除题目 |
| POST | `/api/respondents` | — | 提交答卷并计分 |
| GET | `/api/respondents` | 🔒 | 答卷列表 |
| GET | `/api/respondents/:id` | 🔒 | 答卷详情（含逐题作答） |
| DELETE | `/api/respondents/:id` | 🔒 | 删除答卷（同步清理 CSV） |
| POST | `/api/settings/login` | — | 管理员登录，返回 JWT |
| PUT | `/api/settings/password` | 🔒 | 修改密码（≥6 位） |
| GET | `/api/settings/info-fields` | — | 信息字段配置 |
| PUT | `/api/settings/info-fields` | 🔒 | 更新字段配置 |
| GET | `/api/settings/theories` | — | 理论列表 |
| POST | `/api/settings/theories` | 🔒 | 新增理论 |

---

## 📁 项目结构

```
LearningStyleTest/
├── setup.py                  # 一键环境配置（依赖安装 + 数据库初始化）
├── start.py                  # 一键启动前后端 + 自动打开浏览器
├── backend/
│   ├── index.js              # Express 入口（启动时 CSV → DB 回填）
│   ├── routes/               # questions / respondents / settings 三组路由
│   ├── middleware/           # JWT 鉴权 + async 错误包装器
│   ├── scoring/kolb.js       # Kolb 计分引擎
│   ├── db/                   # Knex 迁移 & 三语种子数据
│   ├── utils/userdata.js     # CSV 双写持久化
│   ├── Userdata/             # respondents.csv 备份（内置 20 条演示数据）
│   └── scripts/              # 虚拟学生数据生成等辅助脚本
└── frontend/
    └── src/
        ├── views/            # TestView（测评流程）/ AdminView（控制台）
        ├── components/       # KolbChart（坐标图）/ QuestionCard / RespondentDrawer
        ├── stores/           # Pinia：test（答题流程）/ admin（控制台）
        ├── i18n/             # zh / en / ja 全量翻译
        └── utils/export.js   # JSON / CSV / XLSX 导出
```

</details>

<details>
<summary>🇬🇧 English</summary>

<h1 align="center">🧭 Learning Style Assessment <code>lst</code></h1>
<p align="center">
  <strong>Kolb learning style assessment for educational research</strong> — trilingual questionnaire, instant scoring, and researcher analytics in one tool
</p>

---

## ✨ Features

- **📝 Four-step test flow**: pick a theory → fill in basic info → forced-choice questionnaire → instant result with coordinate chart
- **🎯 Kolb scoring engine**: accumulates four dimensions (CE / RO / AC / AE), locates the learning type on the AC−CE × AE−RO plane (Converging / Assimilating / Diverging / Accommodating)
- **📊 Researcher console**: manage questions & theories, view the scatter distribution of all respondents (click a dot for details), per-type counts
- **📤 Three export formats**: one-click JSON / CSV / XLSX export, full dataset or single respondent
- **🧩 Configurable info fields**: which fields respondents must fill in (name, student ID, …) is fully managed from the admin console
- **🌐 Trilingual i18n**: instant switching between 中文 / English / 日本語 — questions, type content, and suggestions are fully translated
- **💾 Dual-write persistence**: responses go to both SQLite and `Userdata/respondents.csv`; missing rows are restored from CSV on startup
- **🔐 Admin auth**: bcrypt password hashing + JWT (8-hour expiry), password changeable from the console

---

## 🏗️ Architecture

### Assessment pipeline

```
[Pick theory] → [Fill info] → [Answer questions (jumpable)] → [Submit]
                                                                │ POST /api/respondents
                                                                ▼
                          [Kolb scoring] → [SQLite + CSV dual write] → [Result page + chart]
```

### Entity relations

```
Theory ──1:N──▶ Question (stem + options + dimension scores)
   │
   └────1:N──▶ TypeContent (type name / description / traits / suggestions)

Respondent ──N:1──▶ Theory (answers, scores, axes, type snapshot)
```

### Quadrant typing

```
                     AC−CE ↑ (abstract)
      Assimilating        │        Converging
 ─────────────────────────┼─────────────────────────→ AE−RO (active)
      Diverging           │        Accommodating
```

---

## 🚀 Quick Start

### Requirements

| Dependency | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org) | 18+ | Frontend & backend runtime |
| [Python](https://python.org) | 3.8+ | Setup & launch scripts |

### One-click setup + start

```bash
# 1. First time: install dependencies + initialize database
python setup.py

# 2. Start backend + frontend (auto-opens browser)
python start.py

# 3. Stop: Ctrl+C
```

| Page | URL |
|---|---|
| Test-taker entry | http://localhost:5173/test |
| Researcher admin console | http://localhost:5173/admin |

### Admin account

| Field | Value |
|---|---|
| Default password | `admin123` |
| Change it at | Admin console → Settings → Change Password (min 6 chars) |

> ⚠️ Please change the password immediately after your first login.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 · Vite (lazy routes + vendor chunk splitting) · Element Plus · ECharts · Pinia · vue-i18n |
| Backend | Node.js · Express (unified async error handling) · Knex.js · SQLite · JWT · bcrypt |
| Scripts | Python 3 (setup & one-click launch, UTF-8 output safe on Windows consoles) |

---

## 📡 API Endpoints (15)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check |
| GET | `/api/questions?theory_id=` | — | Question list (ordered) |
| POST | `/api/questions` | 🔒 | Add question (string PK auto-generated) |
| PUT | `/api/questions/:id` | 🔒 | Update question |
| DELETE | `/api/questions/:id` | 🔒 | Delete question |
| POST | `/api/respondents` | — | Submit questionnaire & score |
| GET | `/api/respondents` | 🔒 | Respondent list |
| GET | `/api/respondents/:id` | 🔒 | Respondent detail (per-question answers) |
| DELETE | `/api/respondents/:id` | 🔒 | Delete respondent (CSV cleaned up too) |
| POST | `/api/settings/login` | — | Admin login, returns JWT |
| PUT | `/api/settings/password` | 🔒 | Change password (≥6 chars) |
| GET | `/api/settings/info-fields` | — | Info field configuration |
| PUT | `/api/settings/info-fields` | 🔒 | Update field configuration |
| GET | `/api/settings/theories` | — | Theory list |
| POST | `/api/settings/theories` | 🔒 | Create theory |

---

## 📁 Project Structure

```
LearningStyleTest/
├── setup.py                  # One-click setup (deps install + DB init)
├── start.py                  # One-click launch + auto-open browser
├── backend/
│   ├── index.js              # Express entry (CSV → DB restore on startup)
│   ├── routes/               # questions / respondents / settings routers
│   ├── middleware/           # JWT auth + async error wrapper
│   ├── scoring/kolb.js       # Kolb scoring engine
│   ├── db/                   # Knex migrations & trilingual seed data
│   ├── utils/userdata.js     # CSV dual-write persistence
│   ├── Userdata/             # respondents.csv backup (ships with 20 demo records)
│   └── scripts/              # Helper scripts (fake student generator, …)
└── frontend/
    └── src/
        ├── views/            # TestView (assessment flow) / AdminView (console)
        ├── components/       # KolbChart / QuestionCard / RespondentDrawer
        ├── stores/           # Pinia: test (quiz flow) / admin (console)
        ├── i18n/             # zh / en / ja full translations
        └── utils/export.js   # JSON / CSV / XLSX export
```

</details>

<details>
<summary>🇯🇵 日本語</summary>

<h1 align="center">🧭 学習スタイル診断システム <code>lst</code></h1>
<p align="center">
  <strong>教育研究向けコルブ学習スタイル・オンライン診断ツール</strong> — 3言語アンケート・即時採点・研究者向け分析をワンストップで
</p>

---

## ✨ 主な機能

- **📝 受験者の4ステップフロー**：理論選択 → 基本情報入力 → 強制選択式アンケート → 結果と座標チャートをその場で確認
- **🎯 コルブ採点エンジン**：4次元（CE / RO / AC / AE）を累積採点し、AC−CE × AE−RO の2軸で4象限の学習タイプ（収束 / 同化 / 拡散 / 適応）を判定
- **📊 研究者コンソール**：問題・理論の管理、全受験者の散布図（ポイントをクリックで個人詳細）、タイプ別人数集計
- **📤 3形式エクスポート**：生データを JSON / CSV / XLSX でワンクリック出力（全件・個人単位に対応）
- **🧩 カスタマイズ可能な情報フィールド**：受験者が入力する項目（氏名・学籍番号など）は管理画面から自由に増減可能
- **🌐 3言語対応**：中文 / English / 日本語 を瞬時に切り替え。問題文・タイプ解説・学習アドバイスまで完全翻訳
- **💾 二重書き込み永続化**：回答は SQLite と `Userdata/respondents.csv` に同時保存され、起動時に CSV から不足分を自動復元
- **🔐 管理者認証**：bcrypt ハッシュ + JWT（有効期限8時間）、パスワードはコンソールから変更可能

---

## 🏗️ アーキテクチャ

### 診断パイプライン

```
[理論選択] → [情報入力] → [問題に回答（ジャンプ可）] → [提出]
                                                        │ POST /api/respondents
                                                        ▼
                  [コルブ採点] → [SQLite + CSV 二重書き込み] → [結果ページ + チャート]
```

### エンティティ関係

```
Theory ──1:N──▶ Question（問題文 + 選択肢 + 次元スコア）
   │
   └────1:N──▶ TypeContent（タイプ名 / 説明 / 特徴 / アドバイス）

Respondent ──N:1──▶ Theory（回答・スコア・座標・タイプのスナップショット）
```

### 四象限判定

```
                     AC−CE ↑（抽象）
      同化型 Assimilating │    収束型 Converging
 ─────────────────────────┼─────────────────────────→ AE−RO（積極）
      拡散型 Diverging    │    適応型 Accommodating
```

---

## 🚀 クイックスタート

### 動作環境

| 依存 | バージョン | 用途 |
|---|---|---|
| [Node.js](https://nodejs.org) | 18+ | フロントエンド / バックエンドのランタイム |
| [Python](https://python.org) | 3.8+ | セットアップ / 起動スクリプト |

### ワンクリック構築 + 起動

```bash
# 1. 初回のみ：依存関係のインストール + データベース初期化
python setup.py

# 2. フロント / バックエンドを起動（ブラウザ自動起動）
python start.py

# 3. 停止：Ctrl+C
```

| ページ | URL |
|---|---|
| 受験者テスト入口 | http://localhost:5173/test |
| 研究者管理コンソール | http://localhost:5173/admin |

### 管理者アカウント

| 項目 | 値 |
|---|---|
| 初期パスワード | `admin123` |
| 変更場所 | 管理コンソール → 設定 → パスワード変更（6文字以上） |

> ⚠️ 初回ログイン後、すぐにパスワードを変更してください。

---

## 🛠️ 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Vue 3 · Vite（ルート遅延読み込み + チャンク分割） · Element Plus · ECharts · Pinia · vue-i18n |
| バックエンド | Node.js · Express（統一 async エラーハンドリング） · Knex.js · SQLite · JWT · bcrypt |
| スクリプト | Python 3（環境構築 & ワンクリック起動、Windows コンソールで UTF-8 出力対応） |

---

## 📡 API エンドポイント（15）

| メソッド | パス | 認証 | 説明 |
|---|---|---|---|
| GET | `/api/health` | — | ヘルスチェック |
| GET | `/api/questions?theory_id=` | — | 問題リスト（順序順） |
| POST | `/api/questions` | 🔒 | 問題追加（文字列主キーを自動生成） |
| PUT | `/api/questions/:id` | 🔒 | 問題更新 |
| DELETE | `/api/questions/:id` | 🔒 | 問題削除 |
| POST | `/api/respondents` | — | アンケート提出 & 採点 |
| GET | `/api/respondents` | 🔒 | 回答者リスト |
| GET | `/api/respondents/:id` | 🔒 | 回答者詳細（問題ごとの回答付き） |
| DELETE | `/api/respondents/:id` | 🔒 | 回答者削除（CSV も同時整理） |
| POST | `/api/settings/login` | — | 管理者ログイン、JWT を返す |
| PUT | `/api/settings/password` | 🔒 | パスワード変更（6文字以上） |
| GET | `/api/settings/info-fields` | — | 情報フィールド設定 |
| PUT | `/api/settings/info-fields` | 🔒 | フィールド設定更新 |
| GET | `/api/settings/theories` | — | 理論リスト |
| POST | `/api/settings/theories` | 🔒 | 理論作成 |

---

## 📁 プロジェクト構造

```
LearningStyleTest/
├── setup.py                  # ワンクリック環境構築（依存インストール + DB 初期化）
├── start.py                  # ワンクリック起動 + ブラウザ自動起動
├── backend/
│   ├── index.js              # Express エントリ（起動時に CSV → DB 復元）
│   ├── routes/               # questions / respondents / settings の3ルーター
│   ├── middleware/           # JWT 認証 + async エラーラッパー
│   ├── scoring/kolb.js       # コルブ採点エンジン
│   ├── db/                   # Knex マイグレーション & 3言語シードデータ
│   ├── utils/userdata.js     # CSV 二重書き込み永続化
│   ├── Userdata/             # respondents.csv バックアップ（デモデータ20件同梱）
│   └── scripts/              # 補助スクリプト（ダミー学生データ生成など）
└── frontend/
    └── src/
        ├── views/            # TestView（診断フロー）/ AdminView（コンソール）
        ├── components/       # KolbChart / QuestionCard / RespondentDrawer
        ├── stores/           # Pinia：test（回答フロー）/ admin（コンソール）
        ├── i18n/             # zh / en / ja 完全翻訳
        └── utils/export.js   # JSON / CSV / XLSX エクスポート
```

</details>

---

<h2 align="center">👥 Contributors</h2>
<p align="center">
  <a href="https://github.com/Shinonome-Laboratory"><strong>Hakase Shinonome</strong></a> — project owner & research design<br>
  <strong>Claude (Anthropic)</strong> — Vibe Coding assistant
</p>
