#!/bin/bash
export PATH=/sbin:/usr/sbin:/usr/local/sbin:/usr/local/bin:/usr/bin:/bin
set -xv

tar -zxvf /root/newbee-web.tar.gz /dianyi/app/newbee-web/

# init log file
/bin/bash /root/ypp_log_init.sh

/usr/sbin/nginx  -s reload
