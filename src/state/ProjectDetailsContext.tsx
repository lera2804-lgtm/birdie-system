import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { seedProjectDetails, type ProjectDetails } from '../mocks/settings';

interface ProjectDetailsState {
  details: ProjectDetails;
  setDetails: (details: ProjectDetails) => void;
}

const ProjectDetailsContext = createContext<ProjectDetailsState | null>(null);

export const ProjectDetailsProvider = ({ projectCode, children }: { projectCode: string; children: ReactNode }) => {
  const [details, setDetails] = useState<ProjectDetails>(() => seedProjectDetails(projectCode));

  useEffect(() => {
    setDetails(seedProjectDetails(projectCode));
  }, [projectCode]);

  return <ProjectDetailsContext.Provider value={{ details, setDetails }}>{children}</ProjectDetailsContext.Provider>;
};

export const useProjectDetails = () => {
  const ctx = useContext(ProjectDetailsContext);
  if (!ctx) throw new Error('useProjectDetails must be used within ProjectDetailsProvider');
  return ctx;
};
