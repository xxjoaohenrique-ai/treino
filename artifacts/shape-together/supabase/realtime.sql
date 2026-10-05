-- Supabase Realtime para o Shape Together.
-- Idempotente: pode ser executado mais de uma vez.
do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array[
      'app_users',
      'groups',
      'group_members',
      'day_records',
      'user_preferences'
    ]
    loop
      if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end
$$;

-- Mantém dados antigos suficientes para eventos de update/delete.
alter table public.app_users replica identity full;
alter table public.groups replica identity full;
alter table public.group_members replica identity full;
alter table public.day_records replica identity full;
alter table public.user_preferences replica identity full;
