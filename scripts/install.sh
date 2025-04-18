#!/bin/sh

## Настройка для IPv6
## sudo nano /etc/systemd/resolved.conf
## DNS=2001:4860:4860::8888 2606:4700:4700::1111
## sudo systemctl restart systemd-resolved

## Обновляем пакеты
sudo apt-get update && sudo apt-get upgrade -y

## Устанавливаем Docker
apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

## Устанавливаем проект
mkdir /root/website
git clone https://github.com/kraineff/website.git /root/website
cd /root/website