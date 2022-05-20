apidb:
	docker-compose -f .\api\db\docker-compose.yml up -d 
	make dbstart
dbstart:
	docker start apidbs
apidev:
	npm run api:dev
apiprod:
	npm run api:dev
test:
	npm run chain-test
.PHONY: dockerdbs pgstart createdb dropdb migrateup migratedown apidev apiprod test