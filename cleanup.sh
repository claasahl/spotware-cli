#!/bin/bash

DATE=`date '+%Y-%m-%d'`
FILE="${DATE}.log"
LOG_FILES="log.files"

ls -1 \@*.s | sort > ${LOG_FILES}
cat ${LOG_FILES} | xargs cat >> ${FILE}
tar -czf "${FILE}.tar.gz" ${FILE}
cat ${LOG_FILES} | xargs rm -f
rm -f ${LOG_FILES} ${FILE}
