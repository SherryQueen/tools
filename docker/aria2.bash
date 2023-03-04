docker run -d \
# platform 参数用于兼容 m 系列芯片
--platform linux/amd64 \
--name aria2 \
-p 6800:6800 \
-p 6880:80 \
-p 6888:8080 \
-p 51443:51443 \
-p 51443:51443/udp \
-v {YOUR DIR}:/data \
-v {YOUR CONFIG}:/config \
-e SECRET={YOUR SECRET} \
getnas/aria2
