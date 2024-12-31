.PHONY: build up down restart rebuild logs
all: build

build:
	docker-compose up --build

up:
	docker-compose up -d

down:
	docker-compose down

restart: down up

rebuild:
	docker-compose down
	docker-compose build
	docker-compose up -d

logs:
	docker-compose logs -f