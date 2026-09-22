# SAMU+ (repo `tutoriais`)

Reescrita do mock Next.js (`tag next-final`) em Laravel (branch `main`).
Publicado em `mnrs.com.br/tutoriais`.

- Stack, perfis, auditoria, ambientes: `docs/STACK.md` (itens PENDENTE são decisão do usuário).
- Dados sempre fictícios. Auditoria é append-only: nunca UPDATE/DELETE em tabela de evento.
- Laravel 13 + Inertia React + MariaDB. Dev nativo no Mac (`composer run dev`, http://localhost:8000/tutoriais); Docker só no LIVE (`compose.yaml`).
- Tudo sob prefixo `/tutoriais` (rotas, Fortify, assets). Perfis: `app/Enums/Perfil.php`, áreas/abas: `app/Enums/Area.php`.
