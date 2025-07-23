

import { useState, useEffect } from 'react';
import { ExternalLink, Info } from './icons';

/**
 * Interface representing a resource link in the dashboard
 * @interface DashboardLink
 * @property {string} title - The title of the resource link
 * @property {string} url - The URL the link points to
 * @property {string} description - A brief description of the resource
 */
interface DashboardLink {
  title: string;
  url: string;
  description: string;
}

/**
 * Interface representing a tip displayed in the dashboard
 * @interface DashboardTip
 * @property {string} title - The title of the tip
 * @property {string} content - The content/body of the tip
 * @property {string} category - The category the tip belongs to (e.g., "Security", "Performance")
 */
interface DashboardTip {
  title: string;
  content: string;
  category: string;
}

/**
 * Interface representing the complete dashboard data structure
 * @interface DashboardData
 * @property {DashboardLink[]} links - Array of resource links to display
 * @property {DashboardTip[]} tips - Array of tips to display in rotation
 */
interface DashboardData {
  links: DashboardLink[];
  tips: DashboardTip[];
}

/**
 * Dashboard Component
 *
 * Displays a dashboard with rotating tips and helpful resource links for Linux users.
 * Fetches data from a JSON file and handles loading and error states.
 *
 * @returns {JSX.Element} The rendered dashboard component
 */
const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    /**
     * Fetches dashboard data from the JSON file
     *
     * @async
     * @function fetchDashboardData
     * @returns {Promise<void>} Nothing
     * @throws {Error} If the fetch operation fails
     */
    const fetchDashboardData = async () => {
      try {
        // Fetch the dashboard data from our mock JSON file
        const response = await fetch('/data/dashboard-data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /**
   * Effect hook to rotate through tips every 10 seconds
   * Sets up an interval that cycles through the available tips
   * and cleans up the interval when the component unmounts
   */
  useEffect(() => {
    if (!dashboardData?.tips.length) return;

    const interval = setInterval(() => {
      setCurrentTipIndex(prevIndex =>
        prevIndex === dashboardData.tips.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [dashboardData?.tips.length]);

  if (isLoading) {
    return (
      <div className="mt-8 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800/30 dark:to-gray-700/30 border border-green-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-green-100 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-green-100 dark:bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
        <p className="flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Error loading dashboard
        </p>
        <p className="mt-2">We encountered an error while loading the dashboard: {error.message}</p>
      </div>
    );
  }

  // If no data is available
  if (!dashboardData || (!dashboardData.links.length && !dashboardData.tips.length)) {
    return null;
  }

  const currentTip = dashboardData.tips[currentTipIndex];

  return (
    <div className="mt-8 mb-8 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800/30 dark:to-gray-700/30 border border-green-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-4">
        Linux Distribution Resources
      </h2>

      {/* Tips Section */}
      {dashboardData.tips.length > 0 && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-100 dark:border-gray-700 shadow-inner">
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Tip of the Day
          </h3>
          <div className="animate-fadeIn">
            <h4 className="font-medium text-gray-800 dark:text-white">{currentTip.title}</h4>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{currentTip.content}</p>
            <div className="mt-2">
              <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
                {currentTip.category}
              </span>
            </div>
          </div>
          <div className="flex justify-center mt-3">
            {dashboardData.tips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTipIndex(index)}
                className={`w-2 h-2 mx-1 rounded-full ${
                  index === currentTipIndex
                    ? 'bg-green-600 dark:bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`View tip ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Links Section */}
      {dashboardData.links.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">
            Helpful Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-100 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <h4 className="font-medium text-green-600 dark:text-green-400 flex items-center">
                  {link.title}
                  <ExternalLink className="w-4 h-4 ml-1 inline" />
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 flex-grow">
                  {link.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
