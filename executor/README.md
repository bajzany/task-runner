# Executor

Executor je komponenta systému, která zpracovává úkoly z fronty (RabbitMQ). Každý executor běží jako samostatný kontejner a je dynamicky řízen orchestrátorem podle zatížení systému.

---

## Funkce

- Připojení na RabbitMQ a consumování zpráv z fronty
- Získání detailu úkolu z `customer-api`
- Simulace zpracování úkolu (progress / náhodné chyby)
- Průběžná aktualizace stavu a progressu úkolu
- Možnost selhání nebo přerušení z důvodu zrušení
- Zvládání více pokusů (retry) při `ConnectionTimeoutError`
- Přesun úkolu do chybové fronty po vyčerpání pokusů

---

## Konfigurace

### `.env`

Zkopíruj `.env-example` jako výchozí konfiguraci:

```bash
cp executor/.env-example executor/.env
