-- Create treatment_categories table
CREATE TABLE IF NOT EXISTS public.treatment_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on treatment_categories
ALTER TABLE public.treatment_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to treatment_categories
CREATE POLICY "Public can view treatment categories" ON public.treatment_categories
    FOR SELECT USING (true);

-- Create treatments table
CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    content JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    duration TEXT,
    category_id UUID REFERENCES public.treatment_categories(id) ON DELETE SET NULL,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on treatments
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to treatments
CREATE POLICY "Public can view treatments" ON public.treatments
    FOR SELECT USING (true);

-- Functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_treatments_updated_at
    BEFORE UPDATE ON public.treatments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
