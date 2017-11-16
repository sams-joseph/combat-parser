sudo docker run -d --name=web --restart=always --net=host --log-opt max-size=1g warlogs/ui
sudo docker start web