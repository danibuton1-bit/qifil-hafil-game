CREATE TABLE public.game_progress (
  user_id uuid PRIMARY KEY,
  solo_level int NOT NULL DEFAULT 1,
  online_level int NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.game_progress TO authenticated;
GRANT ALL ON public.game_progress TO service_role;
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own progress read" ON public.game_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own progress insert" ON public.game_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own progress update" ON public.game_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);