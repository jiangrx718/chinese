#!/bin/bash

set -e  # 遇到错误立即退出

IMAGE_PREFIX="chinese-page"
ARCH_SUFFIX="amd64"
CONTAINER_NAME="chinese-page-app"
PORT="8081"
NETWORK="common-app-net"

echo "🚀 开始部署 ${IMAGE_PREFIX} 应用..."

# 获取本地最新版本号的镜像
LATEST_TAG=$(docker images --format "{{.Repository}}:{{.Tag}}" \
  | grep "^${IMAGE_PREFIX}:" \
  | grep "${ARCH_SUFFIX}$" \
  | sed -E "s/^${IMAGE_PREFIX}:([0-9]+\.[0-9]+\.[0-9]+)-${ARCH_SUFFIX}$/\1/" \
  | sort -Vr \
  | head -n 1)

if [[ -z "$LATEST_TAG" ]]; then
  echo "❌ 错误：未找到符合格式的镜像（${IMAGE_PREFIX}:x.y.z-${ARCH_SUFFIX}）"
  echo "请确保镜像已正确拉取或构建"
  exit 1
fi

FULL_IMAGE="${IMAGE_PREFIX}:${LATEST_TAG}-${ARCH_SUFFIX}"
echo "📦 使用镜像版本: ${FULL_IMAGE}"

# 检查网络是否存在
if ! docker network inspect "$NETWORK" &>/dev/null; then
  echo "⚠️  网络 $NETWORK 不存在，尝试创建..."
  docker network create "$NETWORK" || {
    echo "❌ 创建网络失败"
    exit 1
  }
  echo "✅ 网络 $NETWORK 创建成功"
fi

# 停止并移除旧容器（如果存在）
if docker ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
  echo "🛑 停止并移除旧容器: ${CONTAINER_NAME}"
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
  echo "✅ 旧容器已移除"
fi

# 检查端口是否被占用
if netstat -tuln | grep -q ":$PORT "; then
  echo "⚠️  端口 $PORT 已被占用，尝试停止占用进程..."
  # 查找并杀死占用端口的进程
  PID=$(lsof -ti:$PORT 2>/dev/null || true)
  if [[ -n "$PID" ]]; then
    kill -9 $PID 2>/dev/null || true
    echo "✅ 已释放端口 $PORT"
  else
    echo "❌ 端口 $PORT 被占用但无法自动释放，请手动检查"
    exit 1
  fi
fi

# 启动新容器
echo "🚀 启动新容器..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart=always \
  -p "$PORT:80" \
  --network "$NETWORK" \
  "$FULL_IMAGE"

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 3

# 检查容器状态
if docker ps --filter "name=$CONTAINER_NAME" --format "{{.Status}}" | grep -q "Up"; then
  echo "✅ 容器启动成功！"
  echo "📊 容器信息:"
  echo "  名称: $CONTAINER_NAME"
  echo "  镜像: $FULL_IMAGE"
  echo "  端口: 主机 $PORT -> 容器 80"
  echo "  网络: $NETWORK"
  echo "  状态: $(docker ps --filter "name=$CONTAINER_NAME" --format "{{.Status}}")"
  
  # 可选：检查容器健康状态
  echo "🔍 检查应用状态..."
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200\|30[0-9]"; then
    echo "✅ 应用服务响应正常"
  else
    echo "⚠️  应用服务可能尚未完全就绪，请稍后访问 http://localhost:$PORT"
  fi
else
  echo "❌ 容器启动失败，请检查日志："
  docker logs "$CONTAINER_NAME" --tail 20
  exit 1
fi

echo "✨ 部署完成！"
echo "📌 常用命令:"
echo "   查看日志: docker logs -f $CONTAINER_NAME"
echo "   进入容器: docker exec -it $CONTAINER_NAME sh"
echo "   停止服务: docker stop $CONTAINER_NAME"
echo "   删除服务: docker rm -f $CONTAINER_NAME"