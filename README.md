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

# フォルダ構造のみを表示 (ファイルを除外)
code-context --dir ./src --folders-only
```

## オプション

- `--dir, -d` : 検索対象のディレクトリ (デフォルト: カレントディレクトリ)
- `--extensions, -e` : 検索対象のファイル拡張子 (デフォルト: js, py)
- `--exclude, -x` : 除外するディレクトリ (デフォルト: node_modules, dist, .git, __pycache__, venv, env, .env, .venv, build, out)
- `--output, -o` : 出力ファイルパス (指定しない場合は対象ファイルとツリー表示のみ)
- `--format, -f` : 出力フォーマット - json または markdown (デフォルト: markdown)
- `--no-content` : ファイル内容を含めず、構造のみを表示
- `--folders-only, -fo` : フォルダ構造のみを表示 (ファイルを除外)

## 出力例

### マークダウン形式 (デフォルト)

```markdown
# プロジェクト構造解析
## 基本情報
- 解析日時: 2025-03-22T08:30:45.123Z
- ファイル数: 5

## ディレクトリ構造

├── index.js
├── samples\
│   ├── ex\
│   │   └── ex.js
│   ├── inside\
│   │   ├── inside.js
│   │   └── inside_inside\
│   │       ├── ex.ts
│   │       └── inside_inside.js
│   ├── sample.js
│   ├── sample.md
│   └── sample_ex.md
└── simple-test.js

## ファイル内容

### index.js
```javascript
// メインスクリプトのコード
```

### samples/ex/ex.js
```javascript
// ex.jsのコード
```

### samples/inside/inside.js
```javascript
// inside.jsのコード
```
```

### JSON形式

```json
{
  "timestamp": "2025-03-22T08:30:45.123Z",
  "baseDirectory": "/path/to/project",
  "fileCount": 5,
  "files": [
    {
      "path": "index.js",
      "content": "// メインスクリプトのコード"
    },
    {
      "path": "samples/ex/ex.js",
      "content": "// ex.jsのコード"
    },
    {
      "path": "samples/inside/inside.js",
      "content": "// inside.jsのコード"
    }
  ]
}
```

### フォルダ構造のみの表示 (--folders-only)

```
フォルダ構造:
├── samples\
│   ├── ex\
│   ├── inside\
│   │   └── inside_inside\
```

## AIへの活用例

生成された出力をコピーして、以下のようにAIに指示を出すことができます：

```
以下のコードベースを分析し、アーキテクチャの概要、主要コンポーネント、そして改善点を教えてください。

[code-contextの出力結果をここに貼り付け]
```

## ディレクトリ構造

```
.
├── LICENSE
├── README.md
├── index.js                  # メインスクリプト
├── package-lock.json
├── package.json              # パッケージ設定
├── samples                   # サンプルファイル
│   ├── ex
│   │   └── ex.js
│   ├── inside
│   │   ├── inside.js
│   │   └── inside_inside
│   │       ├── ex.ts
│   │       └── inside_inside.js
│   ├── sample.js
│   ├── sample.md
│   └── sample_ex.md          # 期待されるテスト出力
└── simple-test.js            # シンプルテスト
```

## ライセンス

MIT
