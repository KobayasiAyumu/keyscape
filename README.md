# Keyscape

Keyscape は、タイピングのリズムをその場で音とビジュアルに変換する Next.js アプリです。キー入力の間隔や文字種をもとに、リアルタイムで短い generative music を鳴らし、同時にキャンバス上へ波形とパーティクルを描画します。

入力セッションは URL にエンコードして共有できます。共有先では `/play/[id]` ページで同じ構成を再生でき、サーバーやデータベースを使わずに「タイピングの音楽」をやり取りできます。

## Features

- リアルタイム演奏: キー入力ごとに Web Audio API で音を生成
- ビジュアライズ: 入力テンポに応じて色相と粒子表現を変化
- 音色コントロール: 音量、波形、リバーブを UI から調整
- セッション共有: 入力イベントを URL に圧縮して共有
- 再生ページ: 共有リンクから composition を再生
- App Router 構成: Next.js 16 / React 19 ベース

## How It Works

1. `TypingStage` でキー入力を記録します。
2. `useTypingCapture` がキー、入力間隔、特殊キー情報をセッションへ蓄積します。
3. `useAudioEngine` と `note-mapper` が入力内容を音程、長さ、音量、リバーブ量へ変換します。
4. `useVisualizer` と `visualizer-engine` がキャンバス上に波形とパーティクルを描画します。
5. `share-codec` がセッションを Base64 化し、`/play/[id]` で復元して再生します。

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Web Audio API

## Getting Started

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開くと確認できます。

## Available Scripts

- `npm run dev` - 開発サーバー起動
- `npm run build` - 本番ビルド作成
- `npm run start` - 本番サーバー起動
- `npm run lint` - ESLint 実行

型チェックだけを走らせたい場合は次を使えます。

```bash
npx tsc --noEmit
```

## Project Structure

```text
app/
  page.tsx              # メイン体験
  play/[id]/page.tsx    # 共有 composition の再生ページ
components/
  TypingStage.tsx       # 入力 UI
  ControlBar.tsx        # 音量・波形・リバーブ操作
  ShareButton.tsx       # 共有 URL 作成
  PlaybackPlayer.tsx    # 再生 UI
  Visualizer.tsx        # 背景キャンバス
hooks/
  useTypingCapture.ts   # 入力イベント収集
  useAudioEngine.ts     # 音の再生制御
  useVisualizer.ts      # 描画ループ管理
lib/
  audio-engine.ts       # Web Audio 実装
  note-mapper.ts        # キー入力 -> 音情報
  share-codec.ts        # URL 共有用の encode/decode
  visualizer-engine.ts  # パーティクル / 波形描画
types/
  index.ts              # 共通型
```

## Notes

- 音声再生にはブラウザの `AudioContext` を使うため、最初の入力操作後に音が有効になります。
- 共有データは URL に含まれ、サーバー保存はしません。
- 共有時のイベント数は直近 `120` 件まで、テキストは最大 `500` 文字までに制限されています。
- 入力セッション自体は `500` キーまで保持します。

## Future Ideas

- 録音データの書き出し
- 音階やスケールの切り替え
- 共有ページでのテンポ表示
- モバイル向け UI チューニング
