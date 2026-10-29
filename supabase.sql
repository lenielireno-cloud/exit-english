-- Exit English: tabela de alunos e regras de acesso
create table if not exists public.alunos (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  nome text,
  criado_em timestamptz default now(),
  expira_em timestamptz
);
alter table public.alunos enable row level security;

create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;
insert into public.admins values ('leniel.ireno@gmail.com') on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from admins where email = auth.jwt() ->> 'email');
$$;

drop policy if exists "ver" on public.alunos;
drop policy if exists "alterar" on public.alunos;
drop policy if exists "apagar" on public.alunos;
create policy "ver" on public.alunos for select using (auth.uid() = id or public.is_admin());
create policy "alterar" on public.alunos for update using (public.is_admin());
create policy "apagar" on public.alunos for delete using (public.is_admin());

create or replace function public.novo_aluno() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into alunos (id, email, nome) values (new.id, new.email, new.raw_user_meta_data ->> 'nome');
  return new;
end; $$;
drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.novo_aluno();
