sudo docker run -d --name=api --restart=always --log-opt max-size=1g -e BACKEND_PORT=3001 -p 80:3001 warlogs/core sh -c "npm start"
sudo docker start api