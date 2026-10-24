import Header from '../components/Header';
import About from '../components/About';
import Skills from '../components/Skills';
import { profile, skills } from '../data/profile';

export default function Home() {
  return (
    <>
      <Header name={profile.name} role={profile.role} focus={profile.focus} themeColor="rgb(var(--rust))" />
      <About bio={profile.bio} education={profile.education} internship={profile.internship} />
      <Skills skillList={skills} />
    </>
  );
}
