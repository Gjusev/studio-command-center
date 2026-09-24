# Studio Command Center documentation

[← Project overview](../README.md)

| You want to… | Read |
| :--- | :--- |
| Run the demonstration locally | [Getting started](getting-started.md) |
| Understand sessions, studio scoping and data access | [Architecture](architecture.md) |
| Inspect the database bootstrap | [Base schema](../database/schema.sql) and [migration runner](../scripts/migrate.mjs) |
| Follow a mutation through authorization and persistence | [Server actions](../src/app/actions/) |
| Review the demonstration UI | [Screenshot gallery](../README.md#screenshots) |

## Scope

This is a portfolio prototype. Screenshots and the demo seed use synthetic
business data. The architecture guide distinguishes implemented behavior
from remaining production work, including tenant-boundary verification,
versioned migrations and transactional audit persistence.
