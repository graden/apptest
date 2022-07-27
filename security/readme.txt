http://slproweb.com/products/Win32OpenSSL.html  - сайт openSSL для Windows
1. запускаем создание закрытого ключа.
openssl req -x509 -nodes -new -sha512 -days 365 -newkey rsa:4096 -keyout ca.key -out ca.pem -subj "/C=US/CN=MY-CA"

# Опционально: если необходимо, можно заменить MY-CA в CN на что-нибудь другое.
# Если вам захочется проверить информацию сертификата, его содержимое можно вывести, запустив следующий код:
openssl x509 -in ca.pem -text -noout  

2. Создайте файл сертификата с расширением .crt:

openssl x509 -outform pem -in ca.pem -out ca.crt

3. Создайте файл расширения "x509" -  v3.ext:

################################
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names 
[alt_names]
# Локальные хостинги
DNS.1 = localhost
DNS.2 = 127.0.0.1
DNS.3 = ::1 
# Перечислите доменные имена
DNS.4 = local.dev
DNS.5 = my-app.dev
DNS.6 = local.some-app.dev
##################################

# Примечание: пожалуйста, обновите DNS.4, DNS.5 и DNS.6 или удалите их, если у вас не настроены никакие локальные доменные имена.

4. Создайте закрытый ключ и запрос на подпись сертификата:

openssl req -new -nodes -newkey rsa:4096 -keyout localhost.key -out localhost.csr -subj "/C=US/ST=State/L=City/O=Some-Organization-Name/CN=localhost"

# Опционально: страну, штат, город и организацию можно изменять.

5. Создайте самоподписанный сертификат:

openssl x509 -req -sha512 -days 365 -extfile v3.ext -CA ca.crt -CAkey ca.key -CAcreateserial -in localhost.csr -out localhost.crt

6. Регистрация сертификата (ca.crt) на пользовательском ПК 
# Дважды кликните на сертификате ca.crt и разместите его в «Доверенные корневые источники сертификатов».

7. Express.js
const https = require("https");
const fs = require("fs");
const express = require("express");

// прочитайте ключи
const key = fs.readFileSync("localhost.key");
const cert = fs.readFileSync("localhost.crt");

// создайте экспресс-приложение
const app = express();

// создайте HTTPS-сервер
const server = https.createServer({ key, cert }, app);

// добавьте тестовый роут
app.get("/", (req, res) => {
  res.send("this is an secure server");
});

// запустите сервер на порту 8000
server.listen(8000, () => {
  console.log("listening on 8000");
});