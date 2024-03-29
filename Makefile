apidb:
	docker-compose -f .\api\db\docker-compose.yml up -d 
	make dbstart
dbstart:
	docker start apidbs
apidev:
	npm run api:dev
apiprod:
	npm run api:dev
vmnode:
	docker-compose -f .\redis\docker-compose.yml up -d 
	docker start redis
vmnodestop:
	docker stop redis	
peer:
	npm run dev-peer
test:
	npm run chain-test
.PHONY: dockerdbs pgstart createdb dropdb migrateup migratedown apidev apiprod vmnode peer test