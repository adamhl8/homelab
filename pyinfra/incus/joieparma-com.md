```sh
incus launch images:debian/13/cloud joieparma-com \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=2 \
  -d root,size=16GiB
```

`.env`:

```
AWS_ACCESS_KEY_ID=value
AWS_SECRET_ACCESS_KEY=value
```

`compose.yaml`:

```yaml
name: joieparma-com

services:
  wordpress:
    container_name: ${COMPOSE_PROJECT_NAME}-wordpress
    image: wordpress
    restart: always
    ports:
      - 8000:80
    volumes:
      - wordpress:/var/www/html
    environment:
      WORDPRESS_DB_HOST: mysql
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress

  mysql:
    container_name: ${COMPOSE_PROJECT_NAME}-mysql
    image: mysql:8.4
    restart: always
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
      MYSQL_RANDOM_ROOT_PASSWORD: "1"
    volumes:
      - mysql:/var/lib/mysql

  ddns-route53:
    container_name: ${COMPOSE_PROJECT_NAME}-ddns-route53
    image: crazymax/ddns-route53
    restart: always
    environment:
      SCHEDULE: 0 * * * *
      DDNSR53_CREDENTIALS_ACCESSKEYID: ${AWS_ACCESS_KEY_ID}
      DDNSR53_CREDENTIALS_SECRETACCESSKEY: ${AWS_SECRET_ACCESS_KEY}
      DDNSR53_ROUTE53_HOSTEDZONEID: Z0071593388GQFZILFSAV
      DDNSR53_ROUTE53_RECORDSSET_0_NAME: joieparma.com
      DDNSR53_ROUTE53_RECORDSSET_0_TYPE: A
      DDNSR53_ROUTE53_RECORDSSET_0_TTL: 60

volumes:
  wordpress:
  mysql:
```

```sh
docker compose up -d
```
