#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// ファイル構造をツリー形式で表示するためのユーティリティ関数
const treeUtil = {
  /**
   * ファイルパスの配列からツリー文字列を生成する
   * @param {string[]} paths - ファイルパスの配列
   * @param {boolean} foldersOnly - フォルダのみを表示するかどうか
   * @returns {string} ツリー構造を表す文字列
   */
  generateTree(paths, foldersOnly = false) {
    const obj = {};
    
    paths.sort().forEach(path => {
      const parts = path.split('/');
      let current = obj;
      
      // 各パスの部分ごとに処理
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        // 最後の部分（ファイル名）の場合
        if (i === parts.length - 1) {
          if (!foldersOnly) {
            current[part] = null; // ファイル
          }
        } else {
          // ディレクトリの場合
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }
    });
    
    // ルートから始まるツリーを生成
    return this.generateTreeFromObj(obj, '');
  },

  /**
   * フォルダのみのツリー構造を生成する
   * @param {string[]} paths - ファイルパスの配列
   * @returns {string} フォルダのみのツリー構造を表す文字列
   */
  generateFolderTree(paths) {
    // すべてのディレクトリを抽出
    const directories = new Set();
    
    paths.forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';
      
      // ファイル名を除く各ディレクトリパーツを処理
      for (let i = 0; i < parts.length - 1; i++) {
        if (currentPath) {
          currentPath += '/' + parts[i];
        } else {
          currentPath = parts[i];
        }
        directories.add(currentPath);
      }
    });
    
    // ディレクトリパスをソートされた配列に変換
    const sortedDirs = Array.from(directories).sort();
    
    // ディレクトリのみでツリーを構築
    const obj = {};
    sortedDirs.forEach(dirPath => {
      const parts = dirPath.split('/');
      let current = obj;
      
      parts.forEach(part => {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      });
    });
    
    return this.generateTreeFromObj(obj, '');
  },

  /**
   * ツリー文字列を再帰的に生成する
   * @param {Object} obj - ファイル構造オブジェクト
   * @param {string} prefix - 行頭のプレフィックス
   * @returns {string} ツリー文字列
   */
  generateTreeFromObj(obj, prefix = '') {
    if (Object.keys(obj).length === 0) {
      return '';
    }
    
    let result = '';
    const entries = Object.entries(obj);
    
    entries.forEach(([key, value], index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const newPrefix = prefix + (isLast ? '    ' : '│   ');

      const isDir = value !== null;
      result += `${prefix}${connector}${key}${isDir ? '\\' : ''}\n`;
      
      if (isDir) {
        result += this.generateTreeFromObj(value, newPrefix);
      }
    });
    
    return result;
  }
};

// デフォルトの言語設定
const DEFAULT_EXTENSIONS = ['js', 'py']; // JavaScript と Python をデフォルトで対応
const DEFAULT_EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  '.git',
  '__pycache__',
  'venv',
  'env',
  '.env',
  '.venv',
  'build',
  'out'
]; // Python関連のディレクトリも除外対象に追加

// コマンドライン引数の設定
const argv = yargs(hideBin(process.argv))
  .option('dir', {
    alias: 'd',
    type: 'string',
    description: '検索対象のディレクトリパス',
    default: process.cwd()
  })
  .option('extensions', {
    alias: 'e',
    type: 'array',
    description: '検索対象の拡張子（例: js py jsx ts）',
    default: DEFAULT_EXTENSIONS
  })
  .option('exclude', {
    alias: 'x',
    type: 'array',
    description: '除外するディレクトリパス',
    default: DEFAULT_EXCLUDE_DIRS
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: '出力ファイルパス（指定しない場合は対象ファイルとツリー表示のみ）'
  })
  .option('format', {
    alias: 'f',
    type: 'string',
    choices: ['json', 'markdown'],
    description: '出力フォーマット（json または markdown）',
    default: 'markdown'
  })
  .option('no-content', {
    type: 'boolean',
    description: 'ファイル内容を含めない（構造のみ表示）',
    default: false
  })
  .option('folders-only', {
    alias: 'l',
    type: 'boolean',
    description: 'フォルダ構造のみを表示（ファイルを除外）',
    default: false
  })
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .argv;

// 検索対象の拡張子をフォーマット
const extensions = argv.extensions.map(ext => ext.startsWith('.') ? ext : `.${ext}`);

// ディレクトリ構造とファイル内容を取得する関数
async function getDirectoryStructure(baseDir) {
  // オプション設定
  const globOptions = {
    ignore: argv.exclude.map(dir => `**/${dir}/**`),
    absolute: false,
    cwd: baseDir,
    dot: false,
    nodir: true // ディレクトリは除外し、ファイルのみ対象とする
  };

  // 全拡張子を含むパターンで検索
  const filePaths = [];
  for (const ext of extensions) {
    const pattern = `**/*${ext}`;
    const matches = glob.sync(pattern, globOptions);
    filePaths.push(...matches);
  }

  console.log(`検出されたファイル数: ${filePaths.length}`);
  
  const structure = {
    baseDir,
    files: []
  };

  // ファイルの内容を取得
  for (const filePath of filePaths) {
    try {
      const fullPath = path.join(baseDir, filePath);
      const content = argv['no-content'] ? '' : fs.readFileSync(fullPath, 'utf8');
      
      structure.files.push({
        path: filePath,
        content,
        size: Buffer.byteLength(content, 'utf8')
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}: ${error.message}`);
    }
  }

  return structure;
}

// メイン処理
async function main() {
  try {
    const targetDir = path.resolve(argv.dir);
    console.log(`検索対象ディレクトリ: ${targetDir}`);
    console.log(`検索対象拡張子: ${extensions.join(', ')}`);
    console.log(`除外ディレクトリ: ${argv.exclude.join(', ')}`);
    
    // ディレクトリが存在するか確認
    if (!fs.existsSync(targetDir)) {
      throw new Error(`指定されたディレクトリが存在しません: ${targetDir}`);
    }
    
    const structure = await getDirectoryStructure(targetDir);
    
    // 対象ファイル表示
    if (argv.foldersOnly) {
      console.log('フォルダ構造:');
      console.log(treeUtil.generateFolderTree(structure.files.map(file => file.path)));
    } else {
      console.log('対象ファイル:');
      console.log(treeUtil.generateTree(structure.files.map(file => file.path)));
    }
    
    // -oオプションが指定されている場合のみ、完全な出力を生成
    if (argv.output) {
      const output = {
        timestamp: new Date().toISOString(),
        baseDirectory: structure.baseDir,
        fileCount: structure.files.length,
        files: structure.files.map(file => ({
          path: file.path,
          content: file.content
        }))
      };
      
      // 出力形式を選択
      const format = argv.format || 'markdown';
      const includeContent = !argv['no-content'];
      let outputContent = '';
      
      if (format === 'json') {
        outputContent = JSON.stringify(output, null, 2);
      } else if (format === 'markdown') {
        // マークダウン形式の出力を生成
        outputContent = '# プロジェクト構造解析\n';
        outputContent += '## 基本情報\n';
        outputContent += `- 解析日時: ${output.timestamp}\n`;
        outputContent += `- ファイル数: ${output.fileCount}\n\n`;
        
        // ツリー表示を常に含める
        outputContent += '## ディレクトリ構造\n\n';
        if (argv.foldersOnly) {
          outputContent += treeUtil.generateFolderTree(structure.files.map(file => file.path));
        } else {
          outputContent += treeUtil.generateTree(structure.files.map(file => file.path));
        }
        outputContent += '\n';
        
        // ファイル内容を含める場合
        if (includeContent) {
          outputContent += '## ファイル内容\n\n';
          output.files.forEach(file => {
            outputContent += `### ${file.path}\n`;
            outputContent += '```';
            
            // ファイル拡張子に基づいて言語ヒントを追加
            const fileExt = path.extname(file.path).toLowerCase();
            if (fileExt === '.js') outputContent += 'javascript';
            else if (fileExt === '.py') outputContent += 'python';
            else if (fileExt === '.ts') outputContent += 'typescript';
            else if (fileExt === '.jsx' || fileExt === '.tsx') outputContent += 'jsx';
            
            outputContent += '\n';
            outputContent += file.content;
            outputContent += '\n```\n\n';
          });
        } else {
          // ファイル一覧のみ
          outputContent += '## ファイル一覧\n\n';
          output.files.forEach(file => {
            outputContent += `- ${file.path}\n`;
          });
        }
      }
      
      const outputPath = path.resolve(argv.output);
      fs.writeFileSync(outputPath, outputContent);
      console.log(`出力を ${outputPath} に保存しました`);
    }
  } catch (error) {
    console.error(`エラーが発生しました: ${error.message}`);
    process.exit(1);
  }
}

main();
