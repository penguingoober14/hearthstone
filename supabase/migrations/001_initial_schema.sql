-- ============================================================================
-- Hearthstone Meal Planning App - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Creates all core tables, RLS policies, and triggers
-- ============================================================================

-- ============================================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with additional user profile data
-- ============================================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  partner_id uuid references profiles(id) on delete set null,
  preferences jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for profiles
create index idx_profiles_partner_id on profiles(partner_id);
create index idx_profiles_created_at on profiles(created_at);

-- Enable RLS
alter table profiles enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can view their partner's profile"
  on profiles for select
  using (id = (select partner_id from profiles where id = auth.uid()));

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ============================================================================
-- RECIPES TABLE
-- Stores meal recipes (publicly readable, admin-managed)
-- ============================================================================
create table recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  prep_time int, -- in minutes
  cook_time int, -- in minutes
  servings int,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  cuisine text,
  ingredients jsonb, -- array of {name, quantity, unit, optional}
  steps jsonb, -- array of {order, instruction, duration}
  tags text[], -- e.g., ['vegetarian', 'quick', 'budget-friendly']
  estimated_cost decimal(10, 2),
  nutrition jsonb default '{}', -- {calories, protein, carbs, fat, fiber}
  created_by uuid references profiles(id) on delete set null,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for recipes
create index idx_recipes_name on recipes(name);
create index idx_recipes_cuisine on recipes(cuisine);
create index idx_recipes_difficulty on recipes(difficulty);
create index idx_recipes_tags on recipes using gin(tags);
create index idx_recipes_created_by on recipes(created_by);
create index idx_recipes_is_public on recipes(is_public);
create index idx_recipes_created_at on recipes(created_at);

-- Enable RLS
alter table recipes enable row level security;

-- RLS Policies for recipes
create policy "Anyone can view public recipes"
  on recipes for select
  using (is_public = true);

create policy "Users can view their own recipes"
  on recipes for select
  using (auth.uid() = created_by);

create policy "Users can insert their own recipes"
  on recipes for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own recipes"
  on recipes for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "Users can delete their own recipes"
  on recipes for delete
  using (auth.uid() = created_by);

-- ============================================================================
-- INVENTORY TABLE
-- Tracks user's food items in fridge, freezer, and pantry
-- ============================================================================
create table inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  emoji text,
  quantity decimal(10, 2),
  unit text, -- e.g., 'kg', 'lbs', 'pieces', 'cups'
  location text check (location in ('fridge', 'freezer', 'pantry')),
  expiry_date date,
  category text, -- e.g., 'dairy', 'produce', 'meat', 'grains'
  notes text,
  purchased_at date,
  price decimal(10, 2),
  is_staple boolean default false, -- items to always keep stocked
  low_stock_threshold decimal(10, 2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for inventory
create index idx_inventory_user_id on inventory(user_id);
create index idx_inventory_location on inventory(location);
create index idx_inventory_expiry_date on inventory(expiry_date);
create index idx_inventory_category on inventory(category);
create index idx_inventory_name on inventory(name);
create index idx_inventory_user_location on inventory(user_id, location);
create index idx_inventory_user_expiry on inventory(user_id, expiry_date);

-- Enable RLS
alter table inventory enable row level security;

-- RLS Policies for inventory
create policy "Users can view their own inventory"
  on inventory for select
  using (auth.uid() = user_id);

create policy "Users can view partner's inventory"
  on inventory for select
  using (user_id = (select partner_id from profiles where id = auth.uid()));

create policy "Users can insert their own inventory items"
  on inventory for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own inventory items"
  on inventory for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own inventory items"
  on inventory for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- MEAL PLANS TABLE
-- Stores planned meals for each user
-- ============================================================================
create table meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_id uuid references recipes(id) on delete set null,
  custom_meal text, -- for meals not from recipes
  notes text,
  completed boolean default false,
  completed_at timestamptz,
  rating int check (rating is null or (rating >= 1 and rating <= 5)),
  feedback text,
  servings_made int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for meal_plans
create index idx_meal_plans_user_id on meal_plans(user_id);
create index idx_meal_plans_date on meal_plans(date);
create index idx_meal_plans_recipe_id on meal_plans(recipe_id);
create index idx_meal_plans_meal_type on meal_plans(meal_type);
create index idx_meal_plans_completed on meal_plans(completed);
create index idx_meal_plans_user_date on meal_plans(user_id, date);
create index idx_meal_plans_user_date_meal on meal_plans(user_id, date, meal_type);

-- Enable RLS
alter table meal_plans enable row level security;

-- RLS Policies for meal_plans
create policy "Users can view their own meal plans"
  on meal_plans for select
  using (auth.uid() = user_id);

create policy "Users can view partner's meal plans"
  on meal_plans for select
  using (user_id = (select partner_id from profiles where id = auth.uid()));

create policy "Users can insert their own meal plans"
  on meal_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meal plans"
  on meal_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own meal plans"
  on meal_plans for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- USER PROGRESS TABLE
-- Gamification: tracks XP, levels, streaks, achievements, and badges
-- ============================================================================
create table user_progress (
  user_id uuid references profiles(id) on delete cascade primary key,
  level int default 1 check (level >= 1),
  current_xp int default 0 check (current_xp >= 0),
  total_xp int default 0 check (total_xp >= 0),
  streak int default 0 check (streak >= 0),
  longest_streak int default 0 check (longest_streak >= 0),
  last_activity_date date,
  meals_completed int default 0,
  recipes_tried int default 0,
  achievements jsonb default '[]', -- array of {id, name, unlockedAt, description}
  badges jsonb default '[]', -- array of {id, name, tier, earnedAt}
  stats jsonb default '{}', -- flexible stats storage
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for user_progress
create index idx_user_progress_level on user_progress(level);
create index idx_user_progress_streak on user_progress(streak);
create index idx_user_progress_total_xp on user_progress(total_xp);

-- Enable RLS
alter table user_progress enable row level security;

-- RLS Policies for user_progress
create policy "Users can view their own progress"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Users can view partner's progress"
  on user_progress for select
  using (user_id = (select partner_id from profiles where id = auth.uid()));

create policy "Users can insert their own progress"
  on user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- SHOPPING LISTS TABLE (Bonus)
-- Auto-generated or manual shopping lists
-- ============================================================================
create table shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text default 'Shopping List',
  items jsonb default '[]', -- array of {name, quantity, unit, checked, category}
  meal_plan_ids uuid[], -- references to meal_plans that generated this list
  is_active boolean default true,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for shopping_lists
create index idx_shopping_lists_user_id on shopping_lists(user_id);
create index idx_shopping_lists_is_active on shopping_lists(is_active);
create index idx_shopping_lists_user_active on shopping_lists(user_id, is_active);

-- Enable RLS
alter table shopping_lists enable row level security;

-- RLS Policies for shopping_lists
create policy "Users can view their own shopping lists"
  on shopping_lists for select
  using (auth.uid() = user_id);

create policy "Users can view partner's shopping lists"
  on shopping_lists for select
  using (user_id = (select partner_id from profiles where id = auth.uid()));

create policy "Users can insert their own shopping lists"
  on shopping_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own shopping lists"
  on shopping_lists for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own shopping lists"
  on shopping_lists for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Also create initial progress record
  insert into public.user_progress (user_id)
  values (new.id);

  return new;
end;
$$;

-- Trigger to call handle_new_user on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers to all tables with updated_at column
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_recipes_updated_at
  before update on recipes
  for each row execute procedure public.update_updated_at_column();

create trigger update_inventory_updated_at
  before update on inventory
  for each row execute procedure public.update_updated_at_column();

create trigger update_meal_plans_updated_at
  before update on meal_plans
  for each row execute procedure public.update_updated_at_column();

create trigger update_user_progress_updated_at
  before update on user_progress
  for each row execute procedure public.update_updated_at_column();

create trigger update_shopping_lists_updated_at
  before update on shopping_lists
  for each row execute procedure public.update_updated_at_column();

-- Function to set completed_at when meal is marked complete
create or replace function public.handle_meal_completion()
returns trigger
language plpgsql
as $$
begin
  if new.completed = true and old.completed = false then
    new.completed_at = now();
  elsif new.completed = false then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger on_meal_plan_completion
  before update on meal_plans
  for each row execute procedure public.handle_meal_completion();

-- ============================================================================
-- GRANTS
-- Grant usage on schema to authenticated and anon users
-- ============================================================================
grant usage on schema public to anon, authenticated;

grant select on recipes to anon, authenticated;
grant all on profiles to authenticated;
grant all on inventory to authenticated;
grant all on meal_plans to authenticated;
grant all on user_progress to authenticated;
grant all on shopping_lists to authenticated;

grant insert, update, delete on recipes to authenticated;

-- ============================================================================
-- COMMENTS
-- Documentation for tables and columns
-- ============================================================================
comment on table profiles is 'User profiles extending Supabase auth.users';
comment on table recipes is 'Meal recipes - publicly readable, user-created';
comment on table inventory is 'User food inventory tracking (fridge, freezer, pantry)';
comment on table meal_plans is 'Planned meals for users by date and meal type';
comment on table user_progress is 'Gamification progress: XP, levels, streaks, achievements';
comment on table shopping_lists is 'Shopping lists generated from meal plans or created manually';

comment on column profiles.partner_id is 'Reference to partner profile for shared household features';
comment on column profiles.preferences is 'User preferences JSON: dietary restrictions, theme, notifications, etc.';

comment on column recipes.ingredients is 'JSON array of ingredients: [{name, quantity, unit, optional}]';
comment on column recipes.steps is 'JSON array of cooking steps: [{order, instruction, duration}]';
comment on column recipes.nutrition is 'Nutritional info: {calories, protein, carbs, fat, fiber}';

comment on column inventory.is_staple is 'Items to always keep stocked (auto-add to shopping list when low)';
comment on column inventory.low_stock_threshold is 'Quantity threshold to trigger low stock warning';

comment on column user_progress.achievements is 'JSON array of earned achievements';
comment on column user_progress.badges is 'JSON array of earned badges with tiers';
comment on column user_progress.stats is 'Flexible stats storage for future gamification features';
