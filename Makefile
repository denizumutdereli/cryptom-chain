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
	docker-compose -f .\kafka\docker-compose.yml up -d 
	docker start kafka
	docker start kafka
vmnodestop:
	docker stop kafdrop 
	docker stop kafka	
test:
	npm run chain-test
.PHONY: dockerdbs pgstart createdb dropdb migrateup migratedown apidev apiprod vmnode test