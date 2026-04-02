import Link from 'next/link';
import { FiPlus, FiEdit } from 'react-icons/fi';
import { getUserLanguages } from '@/lib/actions/user';
import { Language } from '@/lib/types';
import DeleteButton from '@/components/DeleteButton';

export default async function AdminLanguagesPage() {
  const languages = await getUserLanguages();
  
  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency.toLowerCase()) {
      case 'native':
      case 'fluent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'advanced':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'basic':
      case 'beginner':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-400';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Languages</h1>
          <p className="text-muted-foreground">Manage your language proficiencies</p>
        </div>
        <Link
          href="/admin/languages/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Language
        </Link>
      </div>

      {languages && languages.length > 0 ? (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="py-3 px-4 text-left font-medium">Language</th>
                <th className="py-3 px-4 text-left font-medium">Proficiency</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((language: Language) => (
                <tr key={language.id} className="border-b">
                  <td className="py-3 px-4">{language.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getProficiencyColor(language.proficiency)}`}>
                      {language.proficiency}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/languages/${language.id}/edit`}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <FiEdit className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <DeleteButton 
                        endpoint={`/api/languages/${language.id}/delete`}
                        itemName="language"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Languages Found</h2>
          <p className="text-muted-foreground mb-6">
            You haven't added any languages yet. Add languages to showcase your language proficiencies.
          </p>
          <Link
            href="/admin/languages/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Your First Language
          </Link>
        </div>
      )}
    </div>
  );
} 