FROM 172.30.10.185:15000/cd-build/node-nginx:22-v2
# 安装 gettext 包，提供 envsubst 命令
RUN apt-get update && apt-get install -y gettext-base && rm -rf /var/lib/apt/lists/*

ENV BUILD_DIR gears
# 设置默认值
ENV BACKEND_API_URL=http://ymnewbee.newbee-manage.svc.cluster.local:18080

COPY $BUILD_DIR/manage.ym.conf  /etc/nginx/conf.d/
COPY $BUILD_DIR/newbee-web.tar.gz $BUILD_DIR/ypp_log_init.sh /root/

ADD $BUILD_DIR/paas-bootstrap.sh /
CMD bash /paas-bootstrap.sh
