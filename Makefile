all: build-images up

build-images:
	docker compose -p pwinds build --pull --no-cache

up:
	docker compose -p pwinds up webapp webserver
