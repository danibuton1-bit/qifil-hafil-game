CREATE TABLE public.music_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  path text NOT NULL,
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.music_tracks TO authenticated;
GRANT ALL ON public.music_tracks TO service_role;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in can view music" ON public.music_tracks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Signed-in can add music" ON public.music_tracks FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Signed-in can delete music" ON public.music_tracks FOR DELETE TO authenticated USING (true);
CREATE POLICY "Read music files" ON storage.objects FOR SELECT USING (bucket_id = 'music');
CREATE POLICY "Upload music files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'music');
CREATE POLICY "Delete music files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'music');