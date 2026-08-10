#!/bin/bash
# 枝脉电子族谱 - Docker 一键重启脚本
# 用法：./restart.sh

set -e

echo "🚀 开始处理枝脉电子族谱 Docker 部署..."
echo ""

# 1. 停止并清理旧容器（避免名称冲突）
echo "1. 停止旧容器并清理..."
docker compose down --remove-orphans 2>/dev/null || true
# 额外清理可能存在的同名容器（防止名称冲突）
if docker ps -a --format '{{.Names}}' | grep -q '^family-tree$'; then
  docker stop family-tree 2>/dev/null || true
  docker rm -f family-tree 2>/dev/null || true
  echo "   已清理旧的 family-tree 容器"
fi

# 2. 重新构建镜像并启动
echo ""
echo "2. 正在重新构建镜像并启动（此过程可能需要几分钟）..."
docker compose up -d --build

# 3. 等待容器就绪
echo ""
echo "3. 等待服务启动..."
sleep 3

# 4. 检查状态
echo ""
if docker compose ps | grep -q "family-tree"; then
  PORT=$(docker port family-tree 3000 2>/dev/null | head -1 | cut -d: -f2 || echo "3000")
  echo "✅ 重启成功！"
  echo "   访问地址：http://localhost:${PORT:-3000}"
  echo "   查看日志：docker compose logs -f"
  echo "   停止服务：docker compose down"
else
  echo "⚠️  容器可能未正常启动，请查看日志："
  echo "   docker compose logs -f"
  exit 1
fi
