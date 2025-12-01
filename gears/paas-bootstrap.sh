#!/bin/bash
export PATH=/sbin:/usr/sbin:/usr/local/sbin:/usr/local/bin:/usr/bin:/bin
set -xv
# 在文件开头添加环境变量检查
echo "Current BACKEND_API_URL: ${BACKEND_API_URL}"
# 使用 envsubst 处理配置文件
envsubst '${BACKEND_API_URL}' < /etc/nginx/conf.d/manage.ym.conf > /etc/nginx/conf.d/manage.ym.conf.tmp
cat /etc/nginx/conf.d/manage.ym.conf.tmp  # 调试用，查看替换结果
mv /etc/nginx/conf.d/manage.ym.conf.tmp /etc/nginx/conf.d/manage.ym.conf
# mkdir -p /dianyi/app/newbee-web/
# tar -zxvf /root/newbee-web.tar.gz /dianyi/app/newbee-web/

# 创建必要的目录
mkdir -p /dianyi/app/newbee-web
mkdir -p /dianyi/log
mkdir -p /docker/log

# 解压前端文件 - 修正 tar 命令语法
cd /dianyi/app/newbee-web/
tar -zxf /root/newbee-web.tar.gz --strip-components=1

sed -i "s/<NEW_API_ADDR>/$NEW_API_ADDR/g" /etc/nginx/conf.d/manage.ym.conf
sed -i "s/<ENGINEAPI_ADDR>/$NEW_ENGINEAPI_ADDR/g" /etc/nginx/conf.d/manage.ym.conf
# init log file
/bin/bash /root/ypp_log_init.sh

# /usr/sbin/nginx  -s reload

nginx -t
# 启动 nginx
nginx -g 'daemon off;'