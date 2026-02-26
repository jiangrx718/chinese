#!/bin/bash

IMAGE_PREFIX="chinese-page"
ARCH_SUFFIX="amd64"  # 改为amd64以匹配你现有的镜像

# 获取本地可用的最大版本号
LATEST_TAG=$(docker images --format "{{.Repository}}:{{.Tag}}" \
  | grep "^${IMAGE_PREFIX}:" \
  | grep "${ARCH_SUFFIX}" \
  | sed -E "s/^${IMAGE_PREFIX}:([0-9]+\.[0-9]+\.[0-9]+)-${ARCH_SUFFIX}$/\1/" \
  | sort -Vr \
  | head -n 1)

if [[ -z "$LATEST_TAG" ]]; then
  echo "❌ 未找到符合格式的镜像版本（${IMAGE_PREFIX}:x.y.z-${ARCH_SUFFIX}）"
  exit 1
fi

FULL_IMAGE="${IMAGE_PREFIX}:${LATEST_TAG}-${ARCH_SUFFIX}"

echo "✅ 即将运行镜像: ${FULL_IMAGE}"

# 停止并删除旧容器（如存在）
docker rm -f chinese-page-app 2>/dev/null

# 启动容器
docker run -d \
  --name chinese-page-app \
  --restart=always \
  -p 8081:80 \
  --network common-app-net \
  "$FULL_IMAGE"