# code-context

AIに渡すためのコードベース全体像を生成するCLIツール

## 概要

code-contextは、プロジェクトのコードベースを解析し、AIアシスタント（ChatGPT、Claudeなど）に効果的にコンテキストを提供するためのフォーマットでファイル構造と内容を出力するCLIツールです。ディレクトリ構造を視覚的なツリー形式で表示し、ファイル内容とともにマークダウン形式で出力します。

## インストール

```bash
# グローバルインストール
npm install -g code-context

# または npx で直接実行
npx code-context
```

## 使い方

```bash
# 基本的な使い方
code-context --dir ./src --extensions js jsx ts tsx

# 除外ディレクトリを指定
code-context --dir ./project --extensions js py --exclude node_modules tests dist

# JSON形式で出力
code-context --dir ./src --format json --output structure.json

# マークダウン形式で出力 (デフォルト)
code-context --dir ./src --output structure.md

# ファイル内容を含めずに構造のみ出力
code-context --dir ./src --no-content
```

## オプション

- `--dir, -d` : 検索対象のディレクトリ (デフォルト: カレントディレクトリ)
- `--extensions, -e` : 検索対象のファイル拡張子 (例: js jsx ts)
- `--exclude, -x` : 除外するディレクトリ (デフォルト: node_modules, dist, .git)
- `--output, -o` : 出力ファイルパス (指定しない場合は標準出力)
- `--format, -f` : 出力フォーマット - json または markdown (デフォルト: markdown)
- `--no-content` : ファイル内容を含めず、構造のみを表示

## 出力例

### マークダウン形式 (デフォルト)

```markdown
# プロジェクト構造解析
## 基本情報
- 解析日時: 2025-03-01T08:30:45.123Z
- ファイル数: 3

## ディレクトリ構造

├── src\
│   ├── index.js
│   └── utils.js
└── package.json

## ファイル内容

### src/index.js
```javascript
// ファイル内容がここに表示されます
```

### src/utils.js
```javascript
// ファイル内容がここに表示されます
```

### package.json
```json
// package.jsonの内容がここに表示されます
```
```

### JSON形式

```json
{
  "timestamp": "2025-03-01T08:30:45.123Z",
  "fileCount": 3,
  "files": [
    {
      "path": "src/index.js",
      "content": "// ファイル内容"
    },
    {
      "path": "src/utils.js",
      "content": "// ファイル内容"
    },
    {
      "path": "package.json",
      "content": "// package.jsonの内容"
    }
  ]
}
```

## AIへの活用例

生成された出力をコピーして、以下のようにAIに指示を出すことができます：

```
以下のコードベースを分析し、アーキテクチャの概要、主要コンポーネント、そして改善点を教えてください。

[code-contextの出力結果をここに貼り付け]
```

## テスト

このプロジェクトには以下のテスト機能が含まれています：

```bash
# 単一テスト実行 (特定の出力が期待されるファイルと一致するか検証)
npm test

# Jestを使用した包括的なテスト
npm run test:full

# 変更を監視してテスト実行
npm run test:watch

# カバレッジレポート生成
npm run test:coverage
```

## ディレクトリ構造

```
code-context/
├── index.js                  # メインスクリプト
├── package.json              # パッケージ設定
├── simple-test.js            # シンプルテスト
├── jest.config.js            # Jestの設定
├── samples/                  # サンプルファイル
│   ├── ex/
│   │   └── ex.js
│   ├── inside/
│   │   ├── inside.js
│   │   └── inside_inside/
│   │       ├── ex.ts
│   │       └── inside_inside.js
│   ├── sample.js
│   └── sample_ex.md          # 期待されるテスト出力
└── test/                     # テストディレクトリ
    ├── index.test.js         # Jestテスト
    └── helpers.js            # テスト用ヘルパー関数
```

## ライセンス

MIT
