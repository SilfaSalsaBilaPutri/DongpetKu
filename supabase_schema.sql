-- ==============================================================================
-- DompetKu Database Schema for Supabase PostgreSQL
-- Version: 1.0.0
-- PRD & Coldstart Compliance
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
-- Preset categories have user_id = NULL and is_preset = TRUE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50) NOT NULL DEFAULT 'Tag',
    is_preset BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RECURRING TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    description VARCHAR(255) NOT NULL,
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    description VARCHAR(255) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recurring_transaction_id UUID REFERENCES public.recurring_transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_category_month_year UNIQUE (user_id, category_id, month, year)
);

-- 6. BUDGET ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.budget_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('warning', 'limit_reached', 'over_budget')),
    threshold_percentage NUMERIC(5, 2) NOT NULL,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY SPEED
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_user ON public.budget_alerts(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_recurring_user ON public.recurring_transactions(user_id, is_active);

-- ==============================================================================
-- SEED DEFAULT PRESET CATEGORIES
-- ==============================================================================
INSERT INTO public.categories (name, type, icon, is_preset, user_id) VALUES
    ('Makan & Minum', 'expense', 'Utensils', TRUE, NULL),
    ('Transportasi', 'expense', 'Car', TRUE, NULL),
    ('Kos & Tempat Tinggal', 'expense', 'Home', TRUE, NULL),
    ('Kopi & Nongkrong', 'expense', 'Coffee', TRUE, NULL),
    ('Belanja & Kebutuhan', 'expense', 'ShoppingBag', TRUE, NULL),
    ('Hiburan & Streaming', 'expense', 'Film', TRUE, NULL),
    ('Pendidikan & Buku', 'expense', 'BookOpen', TRUE, NULL),
    ('Tagihan & Pulsa', 'expense', 'Smartphone', TRUE, NULL),
    ('Kesehatan', 'expense', 'HeartPulse', TRUE, NULL),
    ('Uang Bulanan Ortu', 'income', 'Wallet', TRUE, NULL),
    ('Freelance & Proyek', 'income', 'Laptop', TRUE, NULL),
    ('Gaji / Part-time', 'income', 'Briefcase', TRUE, NULL),
    ('Beasiswa', 'income', 'GraduationCap', TRUE, NULL),
    ('Pemasukan Lainnya', 'income', 'Sparkles', TRUE, NULL)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Categories RLS: Preset is visible to all, custom is visible to owner
CREATE POLICY "Public preset categories are readable by everyone"
    ON public.categories FOR SELECT
    USING (is_preset = TRUE OR auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage their custom categories"
    ON public.categories FOR ALL
    USING (auth.uid() = user_id);

-- Transactions RLS
CREATE POLICY "Users can view and manage their own transactions"
    ON public.transactions FOR ALL
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Budgets RLS
CREATE POLICY "Users can view and manage their own budgets"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Budget Alerts RLS
CREATE POLICY "Users can view and manage their own budget alerts"
    ON public.budget_alerts FOR ALL
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Recurring Transactions RLS
CREATE POLICY "Users can view and manage their recurring transactions"
    ON public.recurring_transactions FOR ALL
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Users RLS
CREATE POLICY "Users can view and update their own profile"
    ON public.users FOR ALL
    USING (auth.uid() = id OR auth.uid() IS NULL);

-- ==============================================================================
-- AUTOMATIC BUDGET ALARM TRIGGER FUNCTION
-- Automatically evaluates budget status and generates alert records
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_budget_alarm_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_month INTEGER;
    v_year INTEGER;
    v_budget_id UUID;
    v_budget_amount NUMERIC(15, 2);
    v_total_spent NUMERIC(15, 2);
    v_percentage NUMERIC(5, 2);
    v_alert_type VARCHAR(20);
BEGIN
    -- Only evaluate expenses
    IF NEW.transaction_type = 'expense' THEN
        v_month := EXTRACT(MONTH FROM NEW.transaction_date);
        v_year := EXTRACT(YEAR FROM NEW.transaction_date);

        -- Find active budget for this user, category, month, and year
        SELECT id, amount INTO v_budget_id, v_budget_amount
        FROM public.budgets
        WHERE user_id = NEW.user_id
          AND category_id = NEW.category_id
          AND month = v_month
          AND year = v_year;

        IF FOUND AND v_budget_amount > 0 THEN
            -- Calculate total spending in this category for this month
            SELECT COALESCE(SUM(amount), 0) INTO v_total_spent
            FROM public.transactions
            WHERE user_id = NEW.user_id
              AND category_id = NEW.category_id
              AND transaction_type = 'expense'
              AND EXTRACT(MONTH FROM transaction_date) = v_month
              AND EXTRACT(YEAR FROM transaction_date) = v_year;

            v_percentage := (v_total_spent / v_budget_amount) * 100.0;

            -- Determine alert type
            IF v_percentage >= 100.0 THEN
                v_alert_type := 'over_budget';
            ELSIF v_percentage >= 80.0 THEN
                v_alert_type := 'warning';
            END IF;

            -- Insert alert if threshold reached
            IF v_alert_type IS NOT NULL THEN
                INSERT INTO public.budget_alerts (budget_id, user_id, alert_type, threshold_percentage, triggered_at, is_read)
                VALUES (v_budget_id, NEW.user_id, v_alert_type, v_percentage, NOW(), FALSE);
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to transactions table
DROP TRIGGER IF EXISTS trg_check_budget_alarm ON public.transactions;
CREATE TRIGGER trg_check_budget_alarm
AFTER INSERT OR UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.check_budget_alarm_on_transaction();
