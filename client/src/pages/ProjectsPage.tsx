import Projects from '../components/Projects';
import { projects } from '../data/profile';

export default function ProjectsPage() {
  return (
    <div className="pt-6">
      <Projects projects={projects} />
    </div>
  );
}
