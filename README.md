# Task Runner System

Projekt pro správu a orchestraci asynchronních úkolů využívající NestJS, React, RabbitMQ, MariaDB a Docker. Obsahuje API, UI a orchestrátor pro škálovatelné zpracování úkolů.

---

## Architektura komponent

| Složka         | Popis                                                              |
|----------------|--------------------------------------------------------------------|
| `customer-api` | Backend API (NestJS) pro správu tasků, stavů, statistik a historie |
| `executor`     | Worker – zpracovává úkoly z fronty                                 |
| `orchestrator` | Monitoruje frontu, spouští nebo ukončuje `executor` kontejnery     |
| `frontend`     | Webové rozhraní (React + Tailwind) pro sledování a správu úkolů    |

---

## Spuštění

Projekt lze spustit dvěma způsoby:

### Varianta 1: Lokální vývoj přes `docker compose`

Jednoduchý způsob pro lokální testování:

Před spuštěním je nutné překopírovat konfigurační soubory .env-example do .env ve složkách:
```bash
cp customer-api/.env-example customer-api/.env
cp executor/.env-example executor/.env
cp orchestrator/.env-example orchestrator/.env
cp frontend/.env-example frontend/.env
```
Poté spusť:
```bash
docker compose up --build
```
Systém automaticky postaví všechny kontejnery a propojí je dohromady.

### Varianta 2: Spuštění pomocí `scripts/run.sh`

Tato varianta slouží pro spuštění jednotlivých služeb bez použití `docker-compose`, například na vzdáleném serveru.

>  **POZOR**: Je nutné upravit IP adresu podle prostředí (např. IP serveru nebo stroje).

V souboru [`scripts/run.sh`](./scripts/run.sh) nastav správně tyto proměnné(pokud chceš spustit na lokálním prostředí, zadej svou lokální IP adresu):

```bash
# NUTNO ZMĚNIT V ZÁVISLOSTI NA IP SERVERU
DB_HOST="192.168.1.187"
DB_PORT="3306"
RABBITMQ_URL="amqp://user:user@192.168.1.187:5672"
CUSTOMER_API_URL="http://192.168.1.187:3005"
