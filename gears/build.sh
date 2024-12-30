#!/bin/bash
shopt -s extglob
git_home=$(readlink -f $(dirname $0))/..
cd $git_home

export NODE_HOME=/opt/tools/node-v10.15.1-linux-x64
export PATH=${NODE_HOME}/bin:$PATH

function isError(){
  if [ $? -ne 0 ];then
      echo "失败"
    exit 1
  fi
}
function cleanSpace(){
    rm -rf !(gears)
}

branch=`git status | grep "On branch" | cut -d' ' -f3`
if [[ -f "newbee-web.tar.gz" && "${branch}" != "master" ]]; 
  then
    echo " newbee-web.tar.gz is exist. "
    cp newbee-web.tar.gz gears/newbee-web.tar.gz
else
    echo "-----install-------"
    npm install
    isError
    echo "-----build-------"
    npm run build
    isError
    echo "tar -czf gears/newbee-web.tar.gz output"
    pwd
    tar -czf gears/newbee-web.tar.gz output
    ls -al output/dianyi/app/newbee-web/
fi

cleanSpace
