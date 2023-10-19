create table
  public.keys (
    id uuid not null default gen_random_uuid (),
    "createdAt" timestamp with time zone not null default timezone ('utc'::text, now()),
    name text null,
    description text null,
    "userId" uuid null default auth.uid (),
    value text null,
    "isSecret" boolean not null default false,
    constraint api_keys_pkey primary key (id),
    constraint keys_userId_fkey foreign key ("userId") references auth.users (id)
  ) tablespace pg_default;

  create table
  public.logs (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    request text null,
    response text null,
    token uuid null,
    constraint logs_pkey primary key (id),
    constraint logs_token_fkey foreign key (token) references tokens (id)
  ) tablespace pg_default;

  create table
  public.profiles (
    id uuid not null,
    updated_at timestamp with time zone null,
    username text null,
    full_name text null,
    avatar_url text null,
    user_id uuid null,
    stripe_customer_id text null,
    openai_tokens_used bigint not null default '0'::bigint,
    constraint profiles_pkey primary key (id),
    constraint profiles_stripe_customer_id_key unique (stripe_customer_id),
    constraint profiles_username_key unique (username),
    constraint profiles_id_fkey foreign key (id) references auth.users (id),
    constraint profiles_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
    constraint username_length check ((char_length(username) >= 3))
  ) tablespace pg_default;

  create table
  public.supporters (
    id uuid not null,
    created_at timestamp with time zone not null default now(),
    support_level smallint not null default '0'::smallint,
    expires date null,
    constraint supporters_pkey primary key (id),
    constraint supporters_id_fkey foreign key (id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

  create table
  public.tokens (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default timezone ('utc'::text, now()),
    name text null,
    description text null,
    expiration timestamp with time zone null,
    user_id uuid not null,
    token text not null,
    status text null default 'active'::text,
    times_used integer not null default 0,
    times_ai_assisted integer not null default 0,
    constraint jwt_tokens_pkey primary key (id),
    constraint tokens_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

  create table
  public.transactions (
    id bigint generated by default as identity,
    created_at timestamp with time zone not null default now(),
    data json null,
    stripe_customer_id text null,
    user_id uuid null,
    constraint transactions_pkey primary key (id),
    constraint transactions_user_id_fkey foreign key (user_id) references auth.users (id)
  ) tablespace pg_default;