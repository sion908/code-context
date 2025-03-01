// simple-test.js
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const readFileAsync = promisify(fs.readFile);
const existsAsync = promisify(fs.exists);
const unlinkAsync = promisify(fs.unlink);

/**
 * コマンド出力と基準ファイルを比較するシンプルなテスト
 */
async function runSimpleTest() {
  try {
    // 出力先ファイルパス
    const outputPath = path.resolve('./samples/sample.md');
    
    // 比較対象の基準ファイル
    const referencePath = path.resolve('./samples/sample_ex.md');
    
    // 以前の出力ファイルが存在すれば削除
    if (await existsAsync(outputPath)) {
      await unlinkAsync(outputPath);
      console.log(`既存の出力ファイルを削除しました: ${outputPath}`);
    }
    
    // コマンド実行
    const command = 'node index.js -d samples -e js -o samples/sample.md -x ex --format markdown';
    console.log(`コマンド実行: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    console.log('標準出力:', stdout);
    
    if (stderr) {
      console.error('エラー出力:', stderr);
      process.exit(1);
    }
    
    // 出力ファイルが生成されたか確認
    if (!await existsAsync(outputPath)) {
      console.error('出力ファイルが生成されませんでした');
      process.exit(1);
    }
    
    // 基準ファイルが存在するか確認
    if (!await existsAsync(referencePath)) {
      console.error(`基準ファイルが見つかりません: ${referencePath}`);
      process.exit(1);
    }
    
    // ファイル内容の比較
    const outputContent = await readFileAsync(outputPath, 'utf8');
    const referenceContent = await readFileAsync(referencePath, 'utf8');
    
    // タイムスタンプ部分を無視して比較
    const normalizedOutput = outputContent.replace(/解析日時: .+/, '解析日時: TIMESTAMP');
    const normalizedReference = referenceContent.replace(/解析日時: .+/, '解析日時: TIMESTAMP');
    
    if (normalizedOutput.trim() === normalizedReference.trim()) {
      console.log('✅ テスト成功: 出力ファイルが基準ファイルと一致しました');
      return true;
    } else {
      console.error('❌ テスト失敗: 出力ファイルが基準ファイルと一致しません');
      console.log('--- 差分 ---');
      console.log('出力ファイル:');
      console.log(normalizedOutput);
      console.log('---');
      console.log('基準ファイル:');
      console.log(normalizedReference);
      return false;
    }
  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
    return false;
  }
}

// テスト実行
runSimpleTest().then(success => {
  process.exit(success ? 0 : 1);
});
