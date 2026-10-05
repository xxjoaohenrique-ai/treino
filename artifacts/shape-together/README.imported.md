# Shape Together — Etapa 1: banco de dados online

Esta etapa transforma o protótipo online em um sistema com dados persistentes no PostgreSQL/Supabase, preservando a API que o frontend atual já usa.

## O que foi preparado

- PostgreSQL/Supabase como fonte permanente de verdade.
- Usuários, grupos, membros, registros diários e preferências.
- Fotos separadas do banco, no Storage `avatars`.
- Grupo sem limite fixo de participantes.
- Código/link de convite.
- Row Level Security (RLS) para o futuro acesso direto pelo cliente.
- Índices e triggers de `updated_at`.
- Socket.IO continua disponível e agora publica apenas o estado do grupo correto.
- Migração opcional do antigo `data/db.json`.
- O Google Auth fica deliberadamente para a Etapa 2.

## Por que Supabase?

Ele combina PostgreSQL, Storage, Auth e Realtime. Na Etapa 2 vamos ligar o Google Auth e, quando for conveniente, mover o cliente para o acesso direto com RLS.

## Configuração

1. Crie um projeto no Supabase.
2. No SQL Editor, rode `supabase/schema.sql` inteiro.
3. Copie `.env.example` para `.env`.
4. Preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` com os valores do projeto. A service-role key é somente do servidor e nunca deve ser colocada no HTML.
5. Rode `npm install`.
6. Para uma instalação de demonstração, rode `npm run seed:demo`.
7. Rode `npm start`.
8. Abra `http://localhost:3000`.

## Migração do online antigo

Se você possui uma cópia do `data/db.json` do servidor Express antigo, rode:

```bash
npm run migrate:json -- ./data/db.json
```

A migração cria um grupo novo, preserva os usuários, senhas já hashadas e registros de dias.

## Credenciais de demonstração

O `seed:demo` cria temporariamente:

- `voce / 123456`
- `amigo1 / 123456`
- `amigo2 / 123456`

Troque essas senhas antes de colocar o projeto na internet.

## Segurança

A etapa online usa a service-role key apenas no servidor. O schema já deixa o banco preparado para RLS e associação futura com `auth.users`. Não publique a service-role key nem a coloque em código do navegador.

## Estado atual da etapa

A interface continua sendo a mesma versão visual já aprovada. O objetivo desta etapa é trocar a persistência local/arquivo por um banco durável, sem mexer no desenho do aplicativo.
