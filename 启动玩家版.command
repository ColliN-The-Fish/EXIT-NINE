#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
print '第九出口 · 玩家版'
print '在 Chrome 中打开 http://127.0.0.1:4177/'
print '游玩期间保留此窗口；结束后按 Control+C 关闭服务。'
if command -v node >/dev/null 2>&1; then
  node server.mjs
elif command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 4177 --bind 127.0.0.1 --directory dist
else
  print '需要先安装 Node.js（或 Python 3）才能启动本地网页。'
fi
read '?按回车关闭窗口。'
