# Orchestrator

Orchestrátor je komponenta systému, která sleduje zátěž ve frontě úkolů (RabbitMQ) a podle potřeby dynamicky spouští nebo ukončuje kontejnery s workery (`executory`).

---

## Funkce

- Periodicky zjišťuje počet zpráv ve frontě
- Dynamicky škáluje počet spuštěných `executor` kontejnerů
- Posílá signál pro ukončení `executor` kontejnerů, které nejsou potřeba
- Přizpůsobuje počet `executorů` dle zatížení systému

---

## Konfigurace

Před spuštěním zkopíruj `.env-example` do `.env`:

```bash
cp orchestrator/.env-example orchestrator/.env
````
| Proměnná            | Význam                                                   | Příklad                                      |
|---------------------|-----------------------------------------------------------|----------------------------------------------|
| `RABBITMQ_URL`      | Připojení k RabbitMQ                                      | `amqp://user:user@rabbitmq:5672`             |
| `QUEUE_NAME`        | Název hlavní fronty                                       | `task_queue`                                 |
| `ERROR_QUEUE_NAME`  | Název chybové fronty                                      | `task_queue_error`                           |
| `CUSTOMER_API_URL`  | URL na `customer-api` službu                              | `http://localhost:3005`                      |
| `EXECUTOR_IMAGE`    | Název image pro spouštění executor kontejnerů            | `bajzator/task-runner-executor:latest`       |
| `MAX_EXECUTORS`     | Maximální počet paralelních executorů                    | `5`                                          |
| `MIN_EXECUTORS`     | Minimální počet executorů (např. pro udržení provozu)    | `2`                                          |
| `CHECK_INTERVAL_MS` | Interval kontroly fronty (v ms, volitelný)               | `15000`                                      |
