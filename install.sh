#!/bin/sh

## Обновляем пакеты
sudo apt update && sudo apt upgrade -y

## Устанавливаем UFW
sudo apt install ufw -y
sudo ufw allow ssh
sudo ufw allow 443/tcp
sudo ufw allow 10050/tcp
sudo ufw enable