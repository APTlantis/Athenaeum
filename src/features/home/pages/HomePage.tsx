import { useState, useMemo, useEffect } from 'react';
import { DistroCard } from '../../distributions';
import Dashboard from '../components/Dashboard';
import LoadingSpinner from '../../distributions/components/LoadingSpinner';
import FallbackError from '../../distributions/components/FallbackError';
import { useSyncStatus } from '../../distributions/context/SyncStatusContext';
import { Search, SortAsc, SortDesc } from '../../../shared/icons';
import { distros } from '../../distributions/data/distrosCurrent';
import MetaTags from '../../../components/MetaTags';

// Define distribution categories
const distroCategories = {
  'debian-based': [
    'debian',
    'ubuntu',
    'kubuntu',
    'xubuntu',
    'linuxmint',
    'deepin',
    'kali',
    'parrotos',
    'devuan',
    'mx-antix',
    'kdeneon',
    'trisquel',
  ],
  'arch-based': ['archlinux', 'manjaro', 'endeavour', 'artix', 'blackarch', 'parabola'],
  'rpm-based': ['almalinux', 'rockylinux', 'opensuse', 'fedora-enchilada', 'altlinux'],
  museum: ['templeos', 'phoenixos', 'sparrow', 'hoppi', 'zenith'],
  other: [
    'alpine',
    'gentoo',
    'slackware',
    'voidlinux',
    'calculate',
    'qubes',
    'whonix',
    'puppy',
    'solus',
    'kaos',
    'freebsd',
    'openbsd',
    'flathub',
    'gutenberg',
    'gutenberg-generated',
    'redcore',
  ],
};

const HomePage = () => {
  // Use all distros from the array, memoized to prevent recreation on every render
  const allDistros = useMemo(() => distros || [], []);
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

        // Check if distros data is available
        if (!Array.isArray(allDistros) || allDistros.length === 0) {
          console.error('Distros data issue:', { allDistros });
          throw new Error('No distribution data available');
        }

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setIsLoading(false);
      }
    };

    fetchData();
  }, [allDistros]);

  // Memoized filtered and sorted distros
  const filteredAndSortedDistros = useMemo(() => {
    try {
      // First filter by category if needed
      let result = [...allDistros];

      if (filterCategory !== 'all') {
        result = result.filter(distro =>
          distroCategories[filterCategory as keyof typeof distroCategories]?.includes(distro.id)
        );
      }

      // Then filter by search query if provided
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter(
          distro =>
            distro.id.toLowerCase().includes(query) ||
            distro.title.toLowerCase().includes(query) ||
            distro.description.toLowerCase().includes(query)
        );
      }

      // Always sort alphabetically by title first
      result.sort((a, b) => a.title.localeCompare(b.title));

      // Then sort by status if needed
      if (sortBy !== 'none') {
        result.sort((a, b) => {
          const statusA = syncStatuses[a.id] || 'unknown';
          const statusB = syncStatuses[b.id] || 'unknown';

          // Define order: synced (1), syncing (2), failed (3), unknown (4)
          const getStatusOrder = (status: string): number => {
            switch (status) {
              case 'synced':
                return 1;
              case 'syncing':
                return 2;
              case 'failed':
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
      console.error('Error filtering or sorting distros:', err);
      setError(err instanceof Error ? err : new Error('Error processing distributions'));
      return [];
    }
  }, [allDistros, filterCategory, sortBy, syncStatuses, searchQuery]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <FallbackError
        error={error}
        message="We encountered an error while loading the distributions. Please try again later."
        resetErrorBoundary={() => window.location.reload()}
      />
    );
  }

  // Define structured data for the home page
  const homePageStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'APTlantis - Home',
    description:
      'APTlantis is a blazing-fast Linux mirror hub hosting full repositories, ISOs, and open-source packages for the global FOSS community.',
    url: 'https://aptlantis.net/',
    isPartOf: {
      '@type': 'WebSite',
      name: 'APTlantis',
      url: 'https://aptlantis.net/',
    },
    about: {
      '@type': 'Thing',
      name: 'Linux Distributions',
      description: 'Collection of Linux distributions available for download',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: distros.slice(0, 5).map((distro, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: distro.title,
          description: distro.description,
          url: `https://aptlantis.net/distro/${distro.id}`,
        },
      })),
    },
  };

  return (
    <div className="text-gray-800 dark:text-white transition-colors duration-300 bg-gradient-to-b from-blue-50 to-white dark:from-[#121212] dark:to-[#0a0a0a]">
      <MetaTags
        title="APTlantis – High-Speed Linux Mirrors, ISOs, and Open-Source Tools | Home"
        description="APTlantis is a blazing-fast Linux mirror hub hosting full repositories, ISOs, and open-source packages for the global FOSS community. Find and download your favorite Linux distribution."
        canonicalUrl="https://aptlantis.net/"
        ogTitle="APTlantis – Home | High-Speed Linux Mirrors & ISOs"
        ogDescription="Browse and download Linux distributions from our high-speed mirror. APTlantis provides lightning-fast access to Linux repos, ISO downloads, and open-source archives."
        structuredData={homePageStructuredData}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Dashboard />

        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-center md:text-left mb-4 md:mb-0">
            All Available Distributions
          </h2>

          <div className="flex flex-wrap gap-2">
            {/* Search input */}
            <div className="flex items-center bg-blue-50 dark:bg-[#1a1a1a] rounded-lg p-2 border border-blue-200 dark:border-cyan-500/30 transition-colors duration-300">
              <Search className="w-[18px] h-[18px] text-blue-500 dark:text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search distributions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-[#252525] text-gray-800 dark:text-white rounded p-1 text-sm border border-blue-200 dark:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48 transition-colors duration-300"
                aria-label="Search distributions"
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
                title="Sort by sync status (best first)"
                aria-label="Sort by sync status (best first)"
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
                title="Sort by sync status (worst first)"
                aria-label="Sort by sync status (worst first)"
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
                aria-label="Filter distributions by category"
              >
                <option value="all">All Distros</option>
                <option value="debian-based">Debian-based</option>
                <option value="arch-based">Arch-based</option>
                <option value="rpm-based">RPM-based</option>
                <option value="museum">Museum</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {filteredAndSortedDistros.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No distributions found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria to find what you&apos;re looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
            {filteredAndSortedDistros.map(distro => (
              <DistroCard key={distro.id} {...distro} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
