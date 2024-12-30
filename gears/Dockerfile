FROM 172.30.10.185:15000/yeahmobi-snapshots/web_base:0.3

ENV BUILD_DIR gears

COPY $BUILD_DIR/manage.ym.dy  /dianyi/app/ypp/webserver/conf/conf.d/
COPY $BUILD_DIR/newbee-web.tar.gz $BUILD_DIR/ypp_log_init.sh /root/

ADD $BUILD_DIR/paas-bootstrap.sh /
CMD bash /paas-bootstrap.sh
