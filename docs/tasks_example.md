# Tasks

## Setup
- [x] Python仮想環境 `test_env` を作成
- [x] バックエンド依存パッケージをインストール (fastapi / uvicorn / sqlalchemy / python-jose / passlib / anthropic 他)
- [x] backend / frontend のフォルダ構造とスケルトンファイルを作成
- [x] `.env.example` を用意

## Backend
- [x] database.py - DB接続 / Base / get_db 依存
- [x] models.py - SQLAlchemy で5テーブルを定義
- [x] init_db.py - 全テーブル作成
- [x] seed_questions.py - 105問 + demoユーザー + demoセッション3件投入
- [x] security.py - JWT 発行/検証 + パスワードハッシュ helpers
- [x] dependencies.py - get_current_user (Bearerトークン解読)
- [x] schemas.py - Pydantic リクエスト/レスポンス定義
- [x] elo.py - ELO 計算ロジック + 連続ボーナス/ペナルティ (単体テスト 21件合格)
- [x] test_elo.py - elo の単体テストスクリプト
- [x] routers/sessions.py - セッション開始 / 終了
- [x] routers/questions.py - 次の問題取得 / 解答提出 (ソクラテス式ヒント + ELO自動調整)
- [x] main.py にルーターを登録
- [x] dev_token.py - 開発用 JWT 発行 (DEBUG=true 必須)
- [x] routers/auth.py - register, login, me (JWT)
- [x] routers/dashboard.py - current / history / ai-report (Gemini API 接続済み)
- [x] dashboard.py 拡張: per-session 一発正解率/平均ヒント数/全誤答数、bonus_events、study_calendar(90日)、weekly_comparison、difficulty_accuracy、weakness_questions、hint_heavy_questions
- [x] AI レポートを Gemini API 実呼び出しに差し替え (mock=False)
  - 使用モデル: gemini-2.5-flash (gemini-1.5-flash は 2026 時点で退役)
- [x] レスポンス文字化け修正 (UTF8JSONResponse で Content-Type に charset=utf-8 明示)

## Frontend
- [x] 全ページのshellと路由構造を作成 (App.jsx + react-router-dom)
- [x] AuthContext + ProtectedRoute + NavBar
- [x] axios クライアントに JWT 自動付与 + 401 自動ログアウト
- [x] API ラッパー (auth / sessions / questions / dashboard)
- [x] ログイン / 新規登録ページ (フォーム + デモ自動入力)
- [x] トピック選択ページ (Udemy風、ロックトピックは🔒で Coming Soon)
- [x] 難易度確認ページ (現在のレベル可視化 + クイズ開始)
- [x] クイズページ (問題 + 選択肢 + タイマー + 能力スコアバー + ソクラテス式ヒント)
- [x] セッション結果ページ (能力スコア折れ線 / 応答時間バー / 難易度カーブ / AI評語 / AI推奨)
- [x] 履歴ダッシュボードページ (折れ線 / レーダーチャート / AIレポート / セッション一覧)
- [x] /dashboard を認証後のホーム化 (RootRedirect + Login.jsx を /dashboard 行きに変更)
- [x] 新規ユーザー向け welcome view (空状態時、機能プレビューカード + 「学習を始める」CTA)
- [x] Dashboard を全面再設計 (12 セクション)
- [x] SessionReport を拡張メトリクスで強化
- [x] 復習モード機能を追加
  - DB: sessions.mode, sessions.planned_question_ids, questions.is_generated を ALTER TABLE で追加
  - Backend: routers/review.py (新規) で /api/review/topics と /api/review/questions を提供
  - /api/sessions/start に mode パラメータ追加 (Gemini で類似問題生成し plan を構築)
  - Gemini rate limit 時は過去誤答のみで進めるフォールバック実装
  - 復習モード ELO: 一発正解 +1 / ヒント使用 0 / 全誤答 0 (連続ボーナスなし)
  - Frontend: /review ページ新規、NavBar に「復習」リンク追加
  - Dashboard 弱点マップに「復習を始める」ボタン + 復習済み ✅ バッジ
  - Quiz / SessionReport / Dashboard のセッション一覧に「🎯 復習」表示
  - 統計カード 6 枚 (一発正解率 / 平均ヒント使用数 / 全誤答数を追加)
  - 学習品質スコアセクション (ドーナツチャート + 連続ボーナス/ペナルティイベント)
  - 問題別詳細テーブル (✅一発 / 💡ヒントあり / ❌全誤答 + 難易度遷移マーカー)
- [x] start.sh (Git Bash 用) + start.bat (Windows CMD用、ASCII のみ)
- [x] UX 改善
  - 選択肢シャッフル (決定論的: session_id × question_id でシード)
  - レーダーチャートは <3 トピックで横棒に自動切替
  - 未完了セッション (total=0) を Dashboard 集計/一覧から除外
  - Login にユーザー名欄 autoFocus
  - Quiz 「次の問題へ」ボタンに autoFocus (Enter で進める)
- [x] ユーザー検証

## Done
- 2026-05-26: プロジェクト初期化 (venv + 依存 + フォルダ構造)
- 2026-05-26: DB層完了 (models / init_db / seed) — 105問・demoユーザー・3セッション投入確認済み

### 2026-05-26: sessions / questions API 完成 ✅ ユーザーテスト合格
- 実装ファイル: schemas.py / elo.py / routers/sessions.py / routers/questions.py
- 設計上のポイント
  - ソクラテス式ヒント フロー: ステートレスで `hints_used` を request body で受け取り、未確定/確定を1問1行 UPSERT で管理
  - SessionAnswer に `resolved` 列を追加 (中途放棄と確定済みを区別、ダッシュボード集計は resolved=True のみ対象)
  - ELO自動調整: 速度+正誤+ヒント使用で ±12/±10/±5/-15、score 70 超で昇格・30 未満で降格 (score を 50 にリセット)
  - JWT 認証 (HTTPBearer)
- 補助ツール: dev_token.py (DEBUG=true 必須) で auth.py 未実装時でもテスト可能
- 検証結果
  - /api/sessions/start: 正常
  - /api/questions/next: 正常 (correct_answer 未暴露)
  - /api/questions/answer 正答+快速: ability_delta=12, 難易度昇格トリガー OK
  - ソクラテス式提示フロー: hint_1 → hint_2 → 確定 全パターン OK
  - ELO 昇格/降格/リセット ロジック OK

### 2026-05-26: auth API 完成 ✅ ユーザーテスト合格
- 実装ファイル: routers/auth.py (register / login / me) + schemas.py に Auth 系モデル追加
- 設計上のポイント
  - register 成功時に JWT を即時発行 (続けてログイン不要)
  - login は username 不在とパスワード誤りを区別しない (列挙攻撃対策)
  - /me で現在トークンの有効性とユーザー情報を確認可能
- 関連修正
  - Swagger UI Authorize ボタン対応 (dependencies.py を HTTPBearer security scheme へ移行)
  - port 統一 8080 (Windows の port 8000 予約問題対応, CLAUDE.md / vite.config.js も同期)
- 検証結果: 正常系 + 異常系 (重複 username 409, パスワード短すぎ 422, 不正トークン 401 等) 全て合格

### 2026-05-26: dashboard API 完成
- 実装ファイル: routers/dashboard.py + schemas.py に Dashboard 系 6 モデル追加
- エンドポイント
  - GET /api/dashboard/current/{session_id}: セッション弾出表示用 (能力スコア推移 / 各問の所要時間 / 難易度カーブ / AIコメント)
  - GET /api/dashboard/history: 履歴一覧 + トピック別 progress + Streak (連続学習日数)
  - GET /api/dashboard/ai-report: 学習履歴ベースの AI レポート (Gemini API 実呼び出し)
- 設計上のポイント
  - 集計対象は `resolved=True` のみ
  - Streak: 直近の学習日が今日/昨日の場合のみ連続日数を遡って計算
  - AI 文章生成は `_session_comment` / `_session_next_step` / `_build_ai_report` の 3 関数に隔離
  - レスポンスに `mock` フラグを含め、フロントが mock/実呼び出しを判別可能

### 2026-05-27: Gemini API 接続 ✅
- 実装ファイル: backend/gemini_client.py (新規) + dashboard.py 3関数を差し替え
- 使用モデル: gemini-2.5-flash
  - ユーザー指定の gemini-1.5-flash は 2026 年時点で退役済み、後継の 2.5-flash を採用
  - .env の GEMINI_MODEL で上書き可
- 旧 mock 関数は dashboard.py 内にコメントとして保持 (削除しない方針)
- /ai-report の JSON モード: response_mime_type="application/json" でスキーマ準拠を保証
- フォールバック方針: 
  - /current の AI 文字列は Gemini エラー時に短いフォールバック文を返す (CurrentSessionResponse を壊さない)
  - /ai-report は Gemini エラー時に 503 を返す (フロントが失敗を検知可能)
- 検証結果: /ai-report が `mock: False` で実 AI 生成テキストを返すこと確認

### 2026-05-27: PowerShell 日本語文字化け修正 ✅
- 原因: FastAPI デフォルトの JSONResponse は Content-Type に charset を含まないため、PowerShell 5.1 の Invoke-RestMethod が Latin-1 で復号して文字化け (活用 → æ´»ç¨)
- 修正: main.py に `UTF8JSONResponse(JSONResponse)` を定義し `default_response_class` に設定
- 全レスポンスの Content-Type が `application/json; charset=utf-8` になり、PowerShell でも文字化けせずに表示
