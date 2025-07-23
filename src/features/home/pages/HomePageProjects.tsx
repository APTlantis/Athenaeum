import { useState, useMemo, useEffect } from 'react';
import { ProjectCard } from '../../projects';
import Dashboard from '../components/Dashboard';
import LoadingSpinner from '../../distributions/components/LoadingSpinner';
import FallbackError from '../../distributions/components/FallbackError';
import { useSyncStatus } from '../../distributions/context/SyncStatusContext';
import { Search, SortAsc, SortDesc } from '../../../shared/icons';
import { projects } from '../../projects/data/projectsCurrent';
import MetaTags from '../../../components/MetaTags';

// Define project categories
const projectCategories = {
  'ai-ml': ['tinyllama', 'starcoder', 'the-stack', 'the-stack-v2'],
  'tools-utilities': ['isohasher', 'convertimages', 'mirrorcrustcrates', 'isoscanner', 'organizecrates', 'aptdl'],
  'web-development': ['portfolio-site', 'e-commerce', 'blog-platform'],
  'mobile-development': ['fitness-app', 'weather-app'],
  'game-development': ['unity-game', 'godot-platformer'],
  'data-science': ['data-visualization', 'ml-pipeline'],
  archived: ['legacy-project'],
};

const HomePage = () => {
  // Use all projects from the array, memoized to prevent recreation on every render
  const allProjects = useMemo(() => projects || [], []);
  const { syncStatuses } = useSyncStatus();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // State for sorting and filtering
  const [sortBy, setSortBy] = useState<string>('none');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Simulate loading state and handle potential errors
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call or data loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if projects data is available
        if (!Array.isArray(allProjects) || allProjects.length === 0) {
          console.error('Projects data issue:', { allProjects });
          throw new Error('No project data available');
        }

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setIsLoading(false);
      }
    };

    fetchData();
  }, [allProjects]);

  // Memoized filtered and sorted projects
  const filteredAndSortedProjects = useMemo(() => {
    try {
      // First filter by category if needed
      let result = [...allProjects];

      if (filterCategory !== 'all') {
        result = result.filter(project =>
          projectCategories[filterCategory as keyof typeof projectCategories]?.includes(project.id)
        );
      }

      // Then filter by search query if provided
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter(
          project =>
            project.id.toLowerCase().includes(query) ||
            project.title.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query)
        );
      }

      // Always sort alphabetically by title first
      result.sort((a, b) => a.title.localeCompare(b.title));

      // Then sort by status if needed
      if (sortBy !== 'none') {
        result.sort((a, b) => {
          const statusA = syncStatuses[a.id] || 'unknown';
          const statusB = syncStatuses[b.id] || 'unknown';

          // Define order: active (1), in-progress (2), archived (3), unknown (4)
          const getStatusOrder = (status: string): number => {
            switch (status) {
              case 'active':
                return 1;
              case 'in-progress':
                return 2;
              case 'archived':
                return 3;
              default:
                return 4;
            }
          };

          const orderA = getStatusOrder(statusA);
          const orderB = getStatusOrder(statusB);

          return sortBy === 'asc' ? orderA - orderB : orderB - orderA;
        });
      }

      return result;
    } catch (err) {
      console.error('Error filtering or sorting projects:', err);
      setError(err instanceof Error ? err : new Error('Error processing projects'));
      return [];
    }
  }, [allProjects, filterCategory, sortBy, syncStatuses, searchQuery]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <FallbackError
        error={error}
        message="We encountered an error while loading the projects. Please try again later."
        resetErrorBoundary={() => window.location.reload()}
      />
    );
  }

  // Define structured data for the home page
  const homePageStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Portfolio - Home',
    description:
      'Portfolio showcasing various software development projects and open-source contributions.',
    url: 'https://portfolio.example.com/',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Portfolio',
      url: 'https://portfolio.example.com/',
    },
    about: {
      '@type': 'Thing',
      name: 'Software Projects',
      description: 'Collection of software development projects',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: projects.slice(0, 5).map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: project.title,
          description: project.description,
          url: `https://portfolio.example.com/project/${project.id}`,
        },
      })),
    },
  };

  return (
    <div className="text-gray-800 dark:text-white transition-colors duration-300 bg-gradient-to-b from-blue-50 to-white dark:from-[#121212] dark:to-[#0a0a0a]">
      <MetaTags
        title="Portfolio – Software Development Projects | Home"
        description="Portfolio showcasing various software development projects and open-source contributions. Browse and explore different projects."
        canonicalUrl="https://portfolio.example.com/"
        ogTitle="Portfolio – Home | Software Development Projects"
        ogDescription="Browse and explore software development projects. Portfolio showcasing various programming languages, frameworks, and technologies."
        structuredData={homePageStructuredData}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Dashboard />

        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-center md:text-left mb-4 md:mb-0">
            All Available Projects
          </h2>

          <div className="flex flex-wrap gap-2">
            {/* Search input */}
            <div className="flex items-center bg-blue-50 dark:bg-[#1a1a1a] rounded-lg p-2 border border-blue-200 dark:border-cyan-500/30 transition-colors duration-300">
              <Search className="w-[18px] h-[18px] text-blue-500 dark:text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-[#252525] text-gray-800 dark:text-white rounded p-1 text-sm border border-blue-200 dark:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48 transition-colors duration-300"
                aria-label="Search projects"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Sort controls */}
            <div className="flex items-center bg-blue-50 dark:bg-[#1a1a1a] rounded-lg p-2 border border-blue-200 dark:border-cyan-500/30 transition-colors duration-300">
              <span className="text-sm mr-2 text-blue-700 dark:text-gray-300">Sort by status:</span>
              <button
                onClick={() => setSortBy(sortBy === 'asc' ? 'none' : 'asc')}
                className={`p-1 rounded ${
                  sortBy === 'asc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-[#252525] hover:bg-blue-100 dark:hover:bg-[#2a2a2a]'
                } transition-colors duration-300`}
                title="Sort by status (best first)"
                aria-label="Sort by status (best first)"
                aria-pressed={sortBy === 'asc'}
              >
                <SortAsc className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={() => setSortBy(sortBy === 'desc' ? 'none' : 'desc')}
                className={`p-1 rounded ml-1 ${
                  sortBy === 'desc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-[#252525] hover:bg-blue-100 dark:hover:bg-[#2a2a2a]'
                } transition-colors duration-300`}
                title="Sort by status (worst first)"
                aria-label="Sort by status (worst first)"
                aria-pressed={sortBy === 'desc'}
              >
                <SortDesc className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex items-center bg-blue-50 dark:bg-[#1a1a1a] rounded-lg p-2 border border-blue-200 dark:border-cyan-500/30 transition-colors duration-300">
              <span className="text-sm mr-2 text-blue-700 dark:text-gray-300">Filter:</span>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-white dark:bg-[#252525] text-gray-800 dark:text-white rounded p-1 text-sm border border-blue-200 dark:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-300"
                aria-label="Filter projects by category"
              >
                <option value="all">All Projects</option>
                <option value="ai-ml">AI & Machine Learning</option>
                <option value="tools-utilities">Tools & Utilities</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="game-development">Game Development</option>
                <option value="data-science">Data Science</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {filteredAndSortedProjects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria to find what you&apos;re looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
            {filteredAndSortedProjects.map(project => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;