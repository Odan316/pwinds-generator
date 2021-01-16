all: build-images up

build-images:
	docker-compose build

up:
	docker-compose -p pbta up
