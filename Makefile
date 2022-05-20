apipg:
	docker run --name chain_api_pg -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=secret -d postgres:12-alpine
pgstart:
	docker start chain_api_pg
createdb:
	docker exec -it chain_api_pg createdb --encoding=UTF8 --username=root --owner=root chain_api_db
dropdb:
	docker exec -it chain_api_pg dropdb chain_api_db
migrateup:
	migrate -path api/migration -database "postgresql://root:secret@127.0.0.1:5432/chain_api_db?sslmode=disable" -verbose up
migratedown:
	migrate -path api/migration -database "postgresql://root:secret@127.0.0.1:5432/chain_api_db?sslmode=disable" -verbose down
apidev:
	npm run api:dev
apiprod:
	npm run api:dev
test:
	npm run test
.PHONY: dockerdbs pgstart createdb dropdb migrateup migratedown apidev apiprod test