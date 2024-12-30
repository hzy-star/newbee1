#!/bin/bash
export PATH=/sbin:/usr/sbin:/usr/local/sbin:/usr/local/bin:/usr/bin:/bin
set -xv

# mkdir -p /dianyi/app/newbee-web/
# tar -zxvf /root/newbee-web.tar.gz /dianyi/app/newbee-web/

# 创建必要的目录
mkdir -p /dianyi/app/newbee-web
mkdir -p /dianyi/log
mkdir -p /docker/log

# 解压前端文件 - 修正 tar 命令语法
cd /dianyi/app/newbee-web/
tar -zxf /root/newbee-web.tar.gz --strip-components=1

# init log file
/bin/bash /root/ypp_log_init.sh

# /usr/sbin/nginx  -s reload

# 启动 nginx
# nginx -g 'daemon off;'