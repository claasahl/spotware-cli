#!/bin/bash

DATE=`date -d "yesterday" '+%Y-%m-%d'`

mv start.log "${DATE}.log"
tar -czvf "${DATE}.log.tar.gz" "${DATE}.log"
rm "${DATE}.log"