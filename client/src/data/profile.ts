// Everything the portfolio shows lives here, so components stay free of hardcoded content.

export interface SkillGroup {
  group: string;
  items: string[];
}

export interface ContactLink {
  label: string;
  href: string;
}

export interface Project {
  name: string;
  tagline: string;
  year: string;
  stack: string[];
  points: string[];
  href?: string;
}

export const profile = {
  name: 'Urja Gajera',
  role: 'Computer Science & Engineering student',
  focus: 'Full-stack web development and AI/ML',
  rollNo: '24CS021',
  bio: 'Computer Science and Engineering student focused on full-stack web development and AI/ML. Completed a software development internship as frontend lead in a 4-member team and won 2nd Prize at a hackathon.',
  education: {
    degree: 'B.Tech in Computer Science and Engineering',
    school: 'CSPIT, Charotar University of Science and Technology (CHARUSAT), Anand',
    period: 'Jul 2024 – May 2028',
  },
  internship: {
    company: 'MCT IT Solutions Pvt. Ltd.',
    title: 'Software Development Intern',
    period: 'May 2026 – Jun 2026',
    place: 'Ahmedabad, Gujarat',
    summary:
      'Led frontend development in a 4-member team on EGE Agritech, an agricultural supply-chain platform — role-based dashboards in React and TypeScript, connected to Node.js, Express and MySQL REST APIs.',
  },
};

export const skills: SkillGroup[] = [
  { group: 'Languages', items: ['Python', 'Java', 'C++', 'C', 'JavaScript', 'TypeScript', 'SQL'] },
  { group: 'Frontend', items: ['React', 'Next.js', 'Vite', 'Tailwind CSS', 'HTML', 'CSS', 'Chart.js'] },
  {
    group: 'Backend',
    items: ['Node.js', 'Express.js', 'FastAPI', 'Flask', 'REST APIs', 'JWT', 'NextAuth', 'Socket.IO', 'Prisma', 'SQLAlchemy'],
  },
  { group: 'AI / ML', items: ['LangChain', 'RAG', 'Prompt Engineering', 'Groq', 'Google Gemini', 'OpenRouter', 'Pandas'] },
  { group: 'Databases', items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Supabase'] },
  { group: 'Tools', items: ['Git', 'GitHub', 'Docker', 'Postman', 'Vercel', 'Figma', 'Power BI'] },
];

export const projects: Project[] = [
  {
    name: 'Nirman',
    tagline: 'AI-powered solution builder · 2nd Prize, CHAOS2COMMIT',
    year: '2026',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'RAG'],
    points: [
      'Turns an idea into a working application: analyses the problem, finds missing requirements and creates a solution blueprint.',
      'Built the frontend: landing page, ER and use-case diagrams, an interactive node graph and multilingual support.',
    ],
  },
  {
    name: 'Strux',
    tagline: 'AI-powered personal workspace',
    year: '2025 – 2026',
    stack: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Groq'],
    points: [
      'Chat, tasks, notes, calendar, habits and a focus timer across 9 dashboard modules on a 10-table PostgreSQL database.',
      'Two Groq chat modes with long-term memory, background task extraction and weekly AI reports.',
    ],
    href: 'https://github.com/Urjagajera/Strux',
  },
  {
    name: 'NutriFit',
    tagline: 'Personalised fitness and nutrition platform',
    year: '2025',
    stack: ['Flask', 'MySQL', 'SQLAlchemy', 'Chart.js'],
    points: [
      'Generates diet and workout plans from each user’s BMI and BMR across 12+ pages and 6 tables.',
      'User and Admin roles with password hashing, CSRF protection and progress dashboards.',
    ],
    href: 'https://github.com/Urjagajera/NutriFit',
  },
];

export const contacts: ContactLink[] = [
  { label: 'Email', href: 'mailto:urjagajera12@gmail.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/urja-gajera-a70aa631a' },
  { label: 'GitHub', href: 'https://github.com/Urjagajera' },
  { label: 'Portfolio', href: 'https://portfolio-urjagajeras-projects.vercel.app/' },
  { label: 'CodeChef', href: 'https://www.codechef.com/users/urja07' },
  { label: 'Codolio', href: 'https://codolio.com/profile/Urja12' },
];
