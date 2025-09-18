#! /bin/bash
export PATH=/sbin:/usr/sbin:/usr/local/sbin:/usr/local/bin:/usr/bin:/bin

echo $NAMESPACE

HOSTIP=`ip a|grep inet|grep eth0|awk '{print $2}'|awk -F '/' '{print $1}'`
LOGS_DIR="/docker/log/$NAMESPACE/$HOSTIP"
mkdir -p $LOGS_DIR
chown www-data:www-data $LOGS_DIR
chmod 755 $LOGS_DIR

mkdir -p /tmp/file
cp -ar /dianyi/log/* /tmp/file/
rm -rf /dianyi/log/
ln -s $LOGS_DIR /dianyi/log 
cp -ar /tmp/file/* /dianyi/log/

chown -R www-data:www-data /dianyi/ \
    && chmod 755 -R /dianyi/
