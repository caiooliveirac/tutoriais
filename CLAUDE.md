# SAMU+ (repo `tutoriais`)

Reescrita do mock Next.js (`tag next-final`) em Laravel (branch `main`).
Publicado em `mnrs.com.br/tutoriais`.

- Stack, perfis, auditoria, ambientes: `docs/STACK.md` (itens PENDENTE são decisão do usuário).
- Dados sempre fictícios. Auditoria é append-only: nunca UPDATE/DELETE em tabela de evento.
- Laravel 13 + Inertia React + MariaDB. Dev nativo no Mac (`composer run dev`, http://localhost:8000/tutoriais); Docker só no LIVE (`compose.yaml`).
- Tudo sob prefixo `/tutoriais` (rotas, Fortify, assets). Perfis: `app/Enums/Perfil.php`, áreas/abas: `app/Enums/Area.php`.
- Domínio levantado do mock: `docs/DOMINIO.md`. Plantão fictício: `php artisan migrate:fresh --seed --seeder=LabSeeder` (LAB e dev; nunca prod).
- LIVE `compose.yaml` (3099) e LAB `compose.lab.yml` (4099): mesma imagem, bancos diferentes. Estratégia Reverb/Redis/Horizon: `docs/STACK.md` §8.
- TARM: `pages/atendimento.tsx` (Leaflet + Nominatim + OSRM). API de rastreamento e estimativa: `docs/API.md`. Bases oficiais com coordenadas: `CatalogoSeeder`.
- Dev: `server.php` na raiz existe porque `public/tutoriais/` (assets) colidia com a rota `/tutoriais` no `artisan serve`.
