-- ============================================================================
-- SQL DE CRIAÇÃO DO BANCO DE DADOS - PLATAFORMA ALUMERA
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ============================================================================

-- 1. EXTENSÕES
create extension if not exists "uuid-ossp";

-- 3. CRIAR TABELAS DE NEGÓCIO

-- Tabela: usuarios (espelho de auth.users com perfil de permissões)
create table public.usuarios (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    nome_completo text not null,
    perfil text not null check (perfil in ('administrador', 'arquiteto', 'engenheiro', 'operacional', 'financeiro')),
    ativo boolean not null default true,
    criado_em timestamptz not null default timezone('utc'::text, now()),
    atualizado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: perfis_profissionais (campos adicionais para arquitetos e engenheiros)
create table public.perfis_profissionais (
    id uuid primary key references public.usuarios(id) on delete cascade,
    usuario_id uuid not null unique references public.usuarios(id) on delete cascade,
    tipo_profissional text not null check (tipo_profissional in ('Arquiteto', 'Engenheiro')),
    telefone text not null,
    endereco text not null,
    numero text not null,
    complemento text,
    bairro text not null,
    cidade text not null,
    estado text not null,
    cep text not null,
    empresa_escritorio text,
    registro_profissional text, -- CAU ou CREA
    cnpj text,
    instagram text,
    site text,
    criado_em timestamptz not null default timezone('utc'::text, now()),
    atualizado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: servicos (serviços ofertados em ACM pela Alumera)
create table public.servicos (
    id uuid primary key default gen_random_uuid(),
    nome text not null unique,
    descricao text,
    ativo boolean not null default true,
    ordem integer not null default 0,
    criado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: projetos
create table public.projetos (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references public.usuarios(id) on delete cascade,
    nome text not null,
    tipo_imovel text not null,
    endereco_obra text not null,
    cidade text not null,
    estado text not null,
    descricao text not null,
    observacoes_tecnicas text,
    prazo_desejado text not null,
    status text not null default 'Enviado' check (status in (
        'Enviado', 'Em análise', 'Necessita informações', 'Orçamento em elaboração', 
        'Orçamento enviado', 'Aguardando aprovação', 'Aprovado', 'Contrato', 
        'Em produção', 'Em execução', 'Concluído', 'Arquivado'
    )),
    criado_em timestamptz not null default timezone('utc'::text, now()),
    atualizado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela de relacionamento de n-para-n entre projetos e serviços desejados
create table public.projeto_servicos (
    id uuid primary key default gen_random_uuid(),
    projeto_id uuid not null references public.projetos(id) on delete cascade,
    servico_id uuid not null references public.servicos(id) on delete cascade,
    criado_em timestamptz not null default timezone('utc'::text, now()),
    unique(projeto_id, servico_id)
);

-- Tabela: arquivos_projeto (arquivos técnicos, 3D e PDFs privados enviados)
create table public.arquivos_projeto (
    id uuid primary key default gen_random_uuid(),
    projeto_id uuid not null references public.projetos(id) on delete cascade,
    usuario_id uuid not null references public.usuarios(id) on delete cascade,
    nome_original text not null,
    nome_storage text not null,
    caminho_storage text not null,
    extensao text not null,
    tipo_mime text not null,
    tamanho_bytes bigint not null,
    criado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: mensagens (comunicação interna por projeto entre profissional e Alumera)
create table public.mensagens (
    id uuid primary key default gen_random_uuid(),
    projeto_id uuid not null references public.projetos(id) on delete cascade,
    usuario_id uuid not null references public.usuarios(id) on delete cascade,
    mensagem text not null,
    lida boolean not null default false,
    criado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: orcamentos
create table public.orcamentos (
    id uuid primary key default gen_random_uuid(),
    projeto_id uuid not null references public.projetos(id) on delete cascade,
    numero text not null unique,
    validade date not null,
    subtotal numeric(12,2) not null default 0,
    desconto numeric(12,2) not null default 0,
    total numeric(12,2) not null default 0,
    status text not null default 'Rascunho' check (status in (
        'Rascunho', 'Enviado', 'Visualizado', 'Em negociação', 'Aprovado', 'Recusado', 'Expirado', 'Cancelado'
    )),
    observacoes text,
    criado_por uuid not null references public.usuarios(id),
    criado_em timestamptz not null default timezone('utc'::text, now()),
    atualizado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: itens_orcamento
create table public.itens_orcamento (
    id uuid primary key default gen_random_uuid(),
    orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
    descricao text not null,
    quantidade numeric(10,2) not null default 1.00,
    unidade text not null default 'un',
    valor_unitario numeric(12,2) not null default 0,
    total numeric(12,2) not null default 0,
    criado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: contratos
create table public.contratos (
    id uuid primary key default gen_random_uuid(),
    projeto_id uuid not null references public.projetos(id) on delete cascade,
    numero text not null unique,
    caminho_storage text not null,
    nome_original text not null,
    status text not null default 'Rascunho' check (status in (
        'Rascunho', 'Enviado', 'Aguardando assinatura', 'Assinado', 'Encerrado', 'Cancelado'
    )),
    observacoes text,
    criado_por uuid not null references public.usuarios(id),
    criado_em timestamptz not null default timezone('utc'::text, now()),
    atualizado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: categorias_financeiras (classificação de receitas e despesas)
create table public.categorias_financeiras (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    tipo text not null check (tipo in ('receita', 'despesa')),
    ativo boolean not null default true,
    criado_em timestamptz not null default timezone('utc'::text, now()),
    unique(nome, tipo)
);

-- Tabela: transacoes_financeiras (registro gerencial de caixa)
create table public.transacoes_financeiras (
    id uuid primary key default gen_random_uuid(),
    projeto_id uuid references public.projetos(id) on delete set null,
    usuario_id uuid references public.usuarios(id) on delete set null,
    categoria_id uuid not null references public.categorias_financeiras(id),
    tipo text not null check (tipo in ('receita', 'despesa')),
    descricao text not null,
    valor numeric(12,2) not null default 0,
    data_vencimento date not null,
    data_pagamento date,
    status text not null check (
        (tipo = 'receita' and status in ('Previsto', 'A receber', 'Recebido', 'Atrasado', 'Cancelado')) or
        (tipo = 'despesa' and status in ('Prevista', 'A pagar', 'Paga', 'Atrasada', 'Cancelada'))
    ),
    observacoes text,
    criado_em timestamptz not null default timezone('utc'::text, now()),
    atualizado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: projetos_portfolio (projetos públicos realizados pela Alumera)
create table public.projetos_portfolio (
    id uuid primary key default gen_random_uuid(),
    titulo text not null,
    slug text not null unique,
    categoria text not null,
    descricao text not null,
    localizacao text not null,
    imagem_principal text not null,
    destaque boolean not null default false,
    ativo boolean not null default true,
    criado_em timestamptz not null default timezone('utc'::text, now()),
    atualizado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: imagens_portfolio (galeria de fotos de cada projeto do portfólio)
create table public.imagens_portfolio (
    id uuid primary key default gen_random_uuid(),
    projeto_portfolio_id uuid not null references public.projetos_portfolio(id) on delete cascade,
    caminho_storage text not null,
    texto_alternativo text,
    ordem integer not null default 0,
    criado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: notificacoes
create table public.notificacoes (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references public.usuarios(id) on delete cascade,
    tipo text not null,
    titulo text not null,
    mensagem text not null,
    lida boolean not null default false,
    criado_em timestamptz not null default timezone('utc'::text, now())
);

-- Tabela: atividades (logs e auditoria para a timeline)
create table public.atividades (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid references public.usuarios(id) on delete set null,
    projeto_id uuid references public.projetos(id) on delete cascade,
    tipo text not null,
    descricao text not null,
    dados jsonb,
    criado_em timestamptz not null default timezone('utc'::text, now())
);


-- 4. ÍNDICES DE PERFORMANCE E CONSULTAS FREQUENTES
create index idx_usuarios_email on public.usuarios(email);
create index idx_projetos_usuario_id on public.projetos(usuario_id);
create index idx_projetos_status on public.projetos(status);
create index idx_projetos_criado_em on public.projetos(criado_em);
create index idx_orcamentos_projeto_id on public.orcamentos(projeto_id);
create index idx_orcamentos_status on public.orcamentos(status);
create index idx_mensagens_projeto_id on public.mensagens(projeto_id);
create index idx_transacoes_projeto_id on public.transacoes_financeiras(projeto_id);
create index idx_transacoes_status on public.transacoes_financeiras(status);
create index idx_notificacoes_usuario_id_lida on public.notificacoes(usuario_id, lida);


-- 5. FUNÇÕES E TRIGGERS AUTOMÁTICOS

-- Função genérica para atualizar o timestamp 'atualizado_em'
create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

-- Aplicar o trigger de atualização de data nas tabelas necessárias
create trigger set_timestamp_usuarios
    before update on public.usuarios
    for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp_perfis_profissionais
    before update on public.perfis_profissionais
    for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp_projetos
    before update on public.projetos
    for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp_orcamentos
    before update on public.orcamentos
    for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp_contratos
    before update on public.contratos
    for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp_transacoes
    before update on public.transacoes_financeiras
    for each row execute procedure public.trigger_set_timestamp();

create trigger set_timestamp_projetos_portfolio
    before update on public.projetos_portfolio
    for each row execute procedure public.trigger_set_timestamp();


-- Trigger para criação de registro na tabela 'public.usuarios' assim que um usuário se cadastra no Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_nome text;
  v_perfil text;
begin
  -- Se for o e-mail administrativo principal definido no prompt, atribui 'administrador'
  if new.email = 'alumera@gmail.com' then
    v_perfil := 'administrador';
  else
    v_perfil := coalesce(new.raw_user_meta_data->>'perfil', 'arquiteto');
  end if;

  v_nome := coalesce(new.raw_user_meta_data->>'nome_completo', new.raw_user_meta_data->>'name', 'Usuário Alumera');

  insert into public.usuarios (id, email, nome_completo, perfil, ativo)
  values (
    new.id,
    new.email,
    v_nome,
    v_perfil,
    true
  );

  -- Se for arquiteto ou engenheiro, cria também o perfil profissional correspondente
  if v_perfil in ('arquiteto', 'engenheiro') then
    insert into public.perfis_profissionais (
      id,
      usuario_id,
      tipo_profissional,
      telefone,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      empresa_escritorio,
      registro_profissional,
      cnpj,
      instagram,
      site
    ) values (
      new.id,
      new.id,
      coalesce(new.raw_user_meta_data->>'tipo_profissional', case when v_perfil = 'arquiteto' then 'Arquiteto' else 'Engenheiro' end),
      coalesce(new.raw_user_meta_data->>'telefone', ''),
      coalesce(new.raw_user_meta_data->>'endereco', ''),
      coalesce(new.raw_user_meta_data->>'numero', ''),
      new.raw_user_meta_data->>'complemento',
      coalesce(new.raw_user_meta_data->>'bairro', ''),
      coalesce(new.raw_user_meta_data->>'cidade', ''),
      coalesce(new.raw_user_meta_data->>'estado', ''),
      coalesce(new.raw_user_meta_data->>'cep', ''),
      new.raw_user_meta_data->>'empresa_escritorio',
      new.raw_user_meta_data->>'registro_profissional',
      new.raw_user_meta_data->>'cnpj',
      new.raw_user_meta_data->>'instagram',
      new.raw_user_meta_data->>'site'
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Associar o trigger ao auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 6. POLÍTICAS DE RLS (ROW LEVEL SECURITY)

-- Ativar RLS em todas as tabelas
alter table public.usuarios enable row level security;
alter table public.perfis_profissionais enable row level security;
alter table public.servicos enable row level security;
alter table public.projetos enable row level security;
alter table public.projeto_servicos enable row level security;
alter table public.arquivos_projeto enable row level security;
alter table public.mensagens enable row level security;
alter table public.orcamentos enable row level security;
alter table public.itens_orcamento enable row level security;
alter table public.contratos enable row level security;
alter table public.categorias_financeiras enable row level security;
alter table public.transacoes_financeiras enable row level security;
alter table public.projetos_portfolio enable row level security;
alter table public.imagens_portfolio enable row level security;
alter table public.notificacoes enable row level security;
alter table public.atividades enable row level security;


-- A) Políticas para 'usuarios'
create policy "Administradores tem acesso total a usuarios"
    on public.usuarios for all to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) = 'administrador');

create policy "Usuários podem ver seu próprio perfil"
    on public.usuarios for select to authenticated
    using (id = auth.uid());

create policy "Usuários podem atualizar seus próprios dados de login"
    on public.usuarios for update to authenticated
    using (id = auth.uid())
    with check (id = auth.uid() and perfil = (select perfil from public.usuarios where id = auth.uid())); -- impede mudar perfil

create policy "Permitir leitura geral de perfis para chat/notificações"
    on public.usuarios for select to authenticated
    using (true);


-- B) Políticas para 'perfis_profissionais'
create policy "Administradores tem acesso total a perfis profissionais"
    on public.perfis_profissionais for all to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) = 'administrador');

create policy "Profissionais podem gerenciar seu próprio perfil"
    on public.perfis_profissionais for all to authenticated
    using (usuario_id = auth.uid())
    with check (usuario_id = auth.uid());


-- C) Políticas para 'servicos'
create policy "Qualquer pessoa pode ler servicos"
    on public.servicos for select to public
    using (ativo = true);

create policy "Administradores gerenciam servicos"
    on public.servicos for all to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) = 'administrador');


-- D) Políticas para 'projetos'
create policy "Administradores e Operacional visualizam todos os projetos"
    on public.projetos for select to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) in ('administrador', 'operacional'));

create policy "Profissionais visualizam e criam seus próprios projetos"
    on public.projetos for all to authenticated
    using (usuario_id = auth.uid())
    with check (usuario_id = auth.uid());

create policy "Administradores e Operacional atualizam projetos"
    on public.projetos for update to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) in ('administrador', 'operacional'));


-- E) Políticas para 'projeto_servicos'
create policy "Acesso a projeto_servicos por dono do projeto ou admin/operacional"
    on public.projeto_servicos for all to authenticated
    using (
        (select usuario_id from public.projetos where id = projeto_id) = auth.uid() or
        (select perfil from public.usuarios where id = auth.uid()) in ('administrador', 'operacional')
    );


-- F) Políticas para 'arquivos_projeto'
create policy "Acesso a arquivos por dono do projeto ou admin/operacional"
    on public.arquivos_projeto for all to authenticated
    using (
        (select usuario_id from public.projetos where id = projeto_id) = auth.uid() or
        (select perfil from public.usuarios where id = auth.uid()) in ('administrador', 'operacional')
    );


-- G) Políticas para 'mensagens'
create policy "Acesso a mensagens por participantes do projeto"
    on public.mensagens for all to authenticated
    using (
        (select usuario_id from public.projetos where id = projeto_id) = auth.uid() or
        (select perfil from public.usuarios where id = auth.uid()) in ('administrador', 'operacional', 'financeiro')
    );


-- H) Políticas para 'orcamentos' e 'itens_orcamento'
create policy "Administradores e operacional controlam orcamentos"
    on public.orcamentos for all to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) in ('administrador', 'operacional'));

create policy "Profissionais visualizam orcamentos de seus projetos"
    on public.orcamentos for select to authenticated
    using ((select usuario_id from public.projetos where id = projeto_id) = auth.uid());

-- Itens Orcamento
create policy "Administradores e operacional controlam itens orcamento"
    on public.itens_orcamento for all to authenticated
    using (
        exists (
            select 1 from public.orcamentos o
            where o.id = orcamento_id and
            (select perfil from public.usuarios where id = auth.uid()) in ('administrador', 'operacional')
        )
    );

create policy "Profissionais visualizam itens do orcamento de seus projetos"
    on public.itens_orcamento for select to authenticated
    using (
        exists (
            select 1 from public.orcamentos o
            join public.projetos p on p.id = o.projeto_id
            where o.id = orcamento_id and p.usuario_id = auth.uid()
        )
    );


-- I) Políticas para 'contratos'
create policy "Administradores gerenciam contratos"
    on public.contratos for all to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) = 'administrador');

create policy "Profissionais leem contratos de seus projetos"
    on public.contratos for select to authenticated
    using ((select usuario_id from public.projetos where id = projeto_id) = auth.uid());


-- J) Políticas para 'categorias_financeiras' e 'transacoes_financeiras'
create policy "Administradores e financeiro gerenciam categorias financeiras"
    on public.categorias_financeiras for all to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) in ('administrador', 'financeiro'));

create policy "Administradores e financeiro gerenciam transacoes financeiras"
    on public.transacoes_financeiras for all to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) in ('administrador', 'financeiro'));


-- K) Políticas para 'projetos_portfolio' e 'imagens_portfolio' (Público)
create policy "Qualquer pessoa le o portfolio"
    on public.projetos_portfolio for select to public
    using (ativo = true);

create policy "Administradores gerenciam portfolio"
    on public.projetos_portfolio for all to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) = 'administrador');

-- Imagens do portfólio
create policy "Qualquer pessoa le imagens do portfolio"
    on public.imagens_portfolio for select to public
    using (true);

create policy "Administradores gerenciam imagens do portfolio"
    on public.imagens_portfolio for all to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) = 'administrador');


-- L) Políticas para 'notificacoes'
create policy "Usuários gerenciam suas próprias notificações"
    on public.notificacoes for all to authenticated
    using (usuario_id = auth.uid())
    with check (usuario_id = auth.uid());


-- M) Políticas para 'atividades'
create policy "Administradores e operacional veem todas as atividades"
    on public.atividades for select to authenticated
    using ((select perfil from public.usuarios where id = auth.uid()) in ('administrador', 'operacional'));

create policy "Profissionais veem atividades de seus projetos"
    on public.atividades for select to authenticated
    using ((select usuario_id from public.projetos where id = projeto_id) = auth.uid());

create policy "Permitir gravar atividades"
    on public.atividades for insert to authenticated
    with check (true);


-- 7. SEED INICIAL DE DADOS

-- Inserir Serviços Padrão da Alumera
insert into public.servicos (nome, descricao, ativo, ordem) values
('Fachadas Residenciais em ACM', 'Soluções personalizadas em ACM para fachadas residenciais sofisticadas de alto padrão.', true, 1),
('Portas em ACM', 'Portas majestosas desenvolvidas sob medida com estrutura de alta durabilidade e design contemporâneo.', true, 2),
('Portões de Elevação em ACM', 'Portões de elevação integrados e estruturados sob medida com revestimento em chapas de ACM.', true, 3),
('Portões Eletrônicos em ACM', 'Soluções automatizadas e integradas ao projeto de segurança e arquitetura do cliente.', true, 4),
('Móveis Planejados em ACM', 'Móveis inovadores planejados com tecnologia de ACM trazendo leveza e sofisticação.', true, 5),
('Outros', 'Soluções sob medida e solicitações especiais em ACM conforme projetos.', true, 6)
on conflict (nome) do update set descricao = excluded.descricao, ordem = excluded.ordem;

-- Inserir Categorias Financeiras de Receitas
insert into public.categorias_financeiras (nome, tipo, ativo) values
('Venda/Projeto', 'receita', true),
('Instalação', 'receita', true),
('Outros', 'receita', true)
on conflict (nome, tipo) do update set ativo = excluded.ativo;

-- Inserir Categorias Financeiras de Despesas
insert into public.categorias_financeiras (nome, tipo, ativo) values
('ACM', 'despesa', true),
('Ferragens', 'despesa', true),
('Materiais', 'despesa', true),
('Mão de Obra', 'despesa', true),
('Transporte', 'despesa', true),
('Instalação', 'despesa', true),
('Terceiros', 'despesa', true),
('Administrativo', 'despesa', true),
('Marketing', 'despesa', true),
('Equipamentos', 'despesa', true),
('Manutenção', 'despesa', true),
('Outros', 'despesa', true)
on conflict (nome, tipo) do update set ativo = excluded.ativo;
