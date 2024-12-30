#!/bin/bash
export PATH=/sbin:/usr/sbin:/usr/local/sbin:/usr/local/bin:/usr/bin:/bin
set -xv

tar -zxvf /root/newbee-web.tar.gz /dianyi/app/newbee-web/

# init log file
/bin/bash /root/ypp_log_init.sh

/bin/bash /dianyi/app/newbee-web/web.sh start &
/usr/sbin/sshd -D
