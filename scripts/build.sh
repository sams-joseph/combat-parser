set -e

sudo docker run -d --privileged --name mongodata -v /data/db tianon/true
sudo docker run -d --privileged --name mongo --volumes-from mongodata --net=host mongo:3
sudo docker build -t "warlogs/core" . && sudo docker run --net=host -i warlogs/core sh -c 'npm run lintnofix'