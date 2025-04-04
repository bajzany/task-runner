# Customer API

`customer-api` je hlavní backendová služba systému Task Runner. Je postavena na frameworku [NestJS](https://nestjs.com/) a slouží k vytváření, správě a sledování úkolů (tasků).

---

## Funkce

- CRUD operace nad úkoly
- Vystavuje REST API pro komunikaci s frontendem i executory
- Zaznamenává historii změn stavů úkolů (pomocí TypeORM subscriberu)
- Posílá nové úkoly do fronty (RabbitMQ)
- Poskytuje statistiky 
- Dokumentace API přes Swagger (`/api-docs`)

---

## Endpointy

| Metoda | Cesta                    | Popis                              |
|--------|--------------------------|-------------------------------------|
| GET    | `/tasks`                 | Získání seznamu úkolů (s stránkováním) |
| GET    | `/tasks/:id`             | Detail konkrétního úkolu            |
| GET    | `/tasks/:id/history`     | Historie změn stavu úkolu           |
| GET    | `/tasks/stats`           | Statistiky úkolů                    |
| POST   | `/tasks`                 | Vytvoření nového úkolu              |
| POST   | `/tasks/:id/status`      | Aktualizace stavu / progressu       |
| POST   | `/tasks/:id/restart`     | Znovuspuštění úkolu                 |
| POST   | `/tasks/:id/cancel`      | Zrušení úkolu                       |
| DELETE | `/tasks/:id`             | Odstranění úkolu                    |
| GET    | `/health`                | Základní health-check               |

---

## Swagger dokumentace

Služba vystavuje interaktivní dokumentaci na adrese:
http://localhost:3000/api-docs


Swagger generuje dokumentaci automaticky z dekorátorů (`@ApiProperty`, `@ApiTags` atd.).


## Konfigurace

### `.env`

Zkopíruj výchozí konfiguraci:

```bash
cp customer-api/.env-example customer-api/.env
