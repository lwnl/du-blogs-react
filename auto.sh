#!/bin/bash

# 动态获取用户主目录
USER_HOME=$(eval echo ~${USER})
PROJECT_myBlogs="$USER_HOME/api/my-blogs-react/backend"
PROJECT_duBlogs="$USER_HOME/api/du-blogs-react/backend"
LOG_FILE="$USER_HOME/autorun_ubuntu/start_apps.log"

# 动态获取路径
NODE_PATH=$(which node)
NPM_PATH=$(which npm)
BUN_PATH=$(which bun)
TMUX_PATH=$(which tmux)

echo "==== Starting script at $(date) ====" >> "$LOG_FILE"
echo "[INFO] Using Node: $NODE_PATH" >> "$LOG_FILE"
echo "[INFO] Using npm: $NPM_PATH" >> "$LOG_FILE"
echo "[INFO] Using tmux: $TMUX_PATH" >> "$LOG_FILE"


# 启动项目 PROJECT_myBlogs
# 检查项目目录是否存在
if [ ! -d "$PROJECT_myBlogs" ]; then
  echo "[ERROR] Project directory not found: $PROJECT_myBlogs" | tee -a "$LOG_FILE"
  exit 1
fi

# 检查并创建 PROJECT_myBlogs tmux session
if ! $TMUX_PATH has-session -t myBlogs 2>/dev/null; then
  echo "[INFO] Creating tmux session 'myBlogs'..." | tee -a "$LOG_FILE"
  $TMUX_PATH new-session -d -s myBlogs "cd $PROJECT_myBlogs && $BUN_PATH run dev" >> "$LOG_FILE" 2>&1
else
  echo "[INFO] tmux session 'myBlogs' already exists." >> "$LOG_FILE"
fi

# 启动项目 PROJECT_duBlogs
# 检查项目目录是否存在
if [ ! -d "$PROJECT_duBlogs" ]; then
  echo "[ERROR] Project directory not found: $PROJECT_duBlogs" | tee -a "$LOG_FILE"
  exit 1
fi

# 检查并创建 PROJECT_myBlogs tmux session
if ! $TMUX_PATH has-session -t duBlogs 2>/dev/null; then
  echo "[INFO] Creating tmux session 'duBlogs'..." | tee -a "$LOG_FILE"
  $TMUX_PATH new-session -d -s duBlogs "cd $PROJECT_duBlogs && $BUN_PATH run dev" >> "$LOG_FILE" 2>&1
else
  echo "[INFO] tmux session 'duBlogs' already exists." >> "$LOG_FILE"
fi


# ✅ 显示所有 tmux 会话（终端和日志同时输出）
$TMUX_PATH ls | tee -a "$LOG_FILE"