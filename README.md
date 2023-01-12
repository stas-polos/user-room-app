### Running project with docker-compose
- cloning repository
- ```cd user-room-app```
- execute command ```docker-compose up```

### Running project without docker
- cloning repository
- ```cd user-room-app```
- update .env files for ```[user|room]-service```
- install dependencies ```npm ci```
- running typeorm migrations for user-service and room-service: ```npm run migration:run:user``` and ```npm run migration:run:room```
- running user-service: ```npm run start:dev user-service```
- running room-service: ```npm run start:dev room-service```