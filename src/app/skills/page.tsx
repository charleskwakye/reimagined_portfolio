import { getUserSkills } from '@/lib/actions/user';

// Static generation for instant page loads - revalidated on-demand via admin
export const dynamic = 'force-static';

// For displaying tools
const calculatePercentage = (tool: any) => {
  return tool.familiarity ? (tool.familiarity / 5) * 100 : 80; // Default to 80% if not specified
};

// Default skills for fallback
const defaultFrontendSkills = [
  { name: 'React.js', familiarity: 95 },
  { name: 'Next.js', familiarity: 90 },
  { name: 'TypeScript', familiarity: 85 },
  { name: 'Tailwind CSS', familiarity: 90 },
  { name: 'UI/UX Design', familiarity: 80 }
];

const defaultBackendSkills = [
  { name: 'Node.js', familiarity: 90 },
  { name: 'PostgreSQL', familiarity: 85 },
  { name: 'GraphQL', familiarity: 80 },
  { name: 'REST API Design', familiarity: 95 },
  { name: 'AWS', familiarity: 75 }
];

// Additional skills that might not be categorized
const additionalSkills = [
  'Git', 'Docker', 'CI/CD', 'Jest',
  'Figma', 'Accessibility', 'SEO', 'Performance Optimization',
  'Agile Development', 'Technical Writing', 'Mentoring', 'Project Management'
];

export default async function SkillsPage() {
  // Fetch skills data on the server
  const toolsByCategory = await getUserSkills();

  // Create default categories if data is empty
  const categories = Object.keys(toolsByCategory).length > 0
    ? Object.keys(toolsByCategory)
    : ['Frontend Development', 'Backend Development'];

  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-responsive-4xl font-bold mb-6">Skills & Expertise</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Main skill categories */}
          {categories.map((category, index) => (
            <div key={category}>
              <h2 className="text-responsive-2xl font-semibold mb-4">{category}</h2>

              <div className="space-y-6">
                {toolsByCategory[category] && toolsByCategory[category].length > 0 ? (
                  // Display skills from database
                  toolsByCategory[category].map((tool) => (
                    <div key={tool.id}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{tool.name}</span>
                        <span className="text-muted-foreground">{calculatePercentage(tool)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${calculatePercentage(tool)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback skills if no data
                  (index === 0 ? defaultFrontendSkills : defaultBackendSkills).map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-muted-foreground">{skill.familiarity}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${skill.familiarity}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Skills */}
        <div className="mt-12">
          <h2 className="text-responsive-2xl font-semibold mb-6">Additional Skills</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {additionalSkills.map((skill) => (
              <div key={skill} className="bg-card p-4 rounded-lg shadow-sm text-center">
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-12">
          <h2 className="text-responsive-2xl font-semibold mb-6">Certifications</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium">AWS Certified Developer - Associate</h3>
              <p className="text-muted-foreground text-sm mt-1">Issued by Amazon Web Services (AWS)</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium">Professional Scrum Master I (PSM I)</h3>
              <p className="text-muted-foreground text-sm mt-1">Issued by Scrum.org</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium">Google UX Design Professional Certificate</h3>
              <p className="text-muted-foreground text-sm mt-1">Issued by Google</p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium">React Developer Certification</h3>
              <p className="text-muted-foreground text-sm mt-1">Issued by Meta</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
