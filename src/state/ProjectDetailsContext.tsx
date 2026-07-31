import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ProjectDetails } from '../mocks/settings';

interface ProjectDetailsState {
  details: ProjectDetails;
  loading: boolean;
  setDetails: (details: ProjectDetails) => Promise<{ error: string | null }>;
  archiveObject: () => Promise<{ error: string | null }>;
}

const EMPTY_DETAILS: ProjectDetails = { name: '', startDate: '', address: '', village: '', cadastre: '', contacts: '', cover: '' };

const ProjectDetailsContext = createContext<ProjectDetailsState | null>(null);

const fromRow = (row: {
  title: string; start_date: string | null; address: string; village: string;
  cadastre: string; contacts: string; cover_url: string | null;
}): ProjectDetails => ({
  name: row.title,
  startDate: row.start_date ?? '',
  address: row.address,
  village: row.village,
  cadastre: row.cadastre,
  contacts: row.contacts,
  cover: row.cover_url ?? '',
});

export const ProjectDetailsProvider = ({ projectCode, children }: { projectCode: string; children: ReactNode }) => {
  const [details, setDetailsState] = useState<ProjectDetails>(EMPTY_DETAILS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('objects')
      .select('title, start_date, address, village, cadastre, contacts, cover_url')
      .eq('code', projectCode)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setDetailsState(data ? fromRow(data) : EMPTY_DETAILS);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectCode]);

  const setDetails = async (next: ProjectDetails) => {
    const { error } = await supabase
      .from('objects')
      .update({
        title: next.name,
        start_date: next.startDate || null,
        address: next.address,
        village: next.village,
        cadastre: next.cadastre,
        contacts: next.contacts,
        cover_url: next.cover || null,
      })
      .eq('code', projectCode);
    if (!error) setDetailsState(next);
    return { error: error?.message ?? null };
  };

  const archiveObject = async () => {
    const { error } = await supabase.from('objects').update({ archived: true }).eq('code', projectCode);
    return { error: error?.message ?? null };
  };

  return <ProjectDetailsContext.Provider value={{ details, loading, setDetails, archiveObject }}>{children}</ProjectDetailsContext.Provider>;
};

export const useProjectDetails = () => {
  const ctx = useContext(ProjectDetailsContext);
  if (!ctx) throw new Error('useProjectDetails must be used within ProjectDetailsProvider');
  return ctx;
};
