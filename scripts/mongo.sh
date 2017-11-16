sudo docker run -d --name mongo --restart=always --volumes-from mongodata --net=host mongo:3
sudo docker start mongo