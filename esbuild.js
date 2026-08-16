/**
 * 打包脚本：把 src/extension.ts 及其依赖打包为 dist/extension.js
 * 用法：
 *   node esbuild.js                 # 开发构建（不压缩，带 sourcemap）
 *   node esbuild.js --production    # 发布构建（压缩，不带 sourcemap）
 *   node esbuild.js --watch         # 监听模式
 */
const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node20',
    external: ['vscode'],
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    outfile: 'dist/extension.js',
    logLevel: 'silent',
  });

  if (watch) {
    await ctx.watch();
    console.log('[esbuild] 监听中，修改 src 后自动重新打包…');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((err) => {
  console.error('[esbuild] 打包失败:', err);
  process.exit(1);
});
