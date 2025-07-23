import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projects } from '@/features/projects';
import { useSyncStatus } from '../../distributions/context/SyncStatusContext';
import { useToast } from '../../distributions/hooks/useToast';
import LoadingSpinner from '../../distributions/components/LoadingSpinner';
import FallbackError from '../../distributions/components/FallbackError';
import { Copy, ExternalLink, ChevronRight, ChevronLeft } from '../../distributions/components/icons';
import MetaTags from '../../../components/MetaTags';

interface Project {
  id: string;
  title: string;
  description: string;
  logoSrc: string;
  websiteUrl: string;
  repoUrl: string;
  demoUrl?: string;
  aboutText?: string;
  longDescription?: string;
  releaseYear?: number;
  version?: string;
  minimumRequirements?: string;
  recommendedRequirements?: string;
  buttonColor?: string;
  technologies?: string[];
  languages?: string[];
  frameworks?: string[];
  features?: string[];
}

type SyncStatus = 'active' | 'in-progress' | 'archived';
type SyncStatuses = Record<string, SyncStatus>;

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'gallery'>('overview');
  const [imageError, setImageError] = useState(false);
  const { syncStatuses } = useSyncStatus();
  const { toast } = useToast();

  // State for navigation between projects
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [sliderValue, setSliderValue] = useState<number>(0);

  // Placeholder images for gallery
  const placeholderImages = [
    '/images/eris-discord-and-strife.webp',
    '/images/hecate.webp',
    '/images/morrigan-war-fate.webp',
    '/images/DALL·E 2025-06-26 13.36.39 - A neon-style emblem featuring Delirium, a fictional goddess of chaos, madness, and surreal beauty. The figure is centered and fully visible inside a g.webp',
    '/images/DALL·E 2025-06-26 13.37.41 - A neon-style emblem featuring Hel, the Norse goddess of the underworld. The figure is centered and fully visible inside a glowing circular neon ring. .webp',
    '/images/DALL·E 2025-06-26 13.37.49 - A neon-style emblem featuring Baba Yaga, the chaotic witch of Slavic folklore. The figure is centered and fully visible inside a glowing circular neon.webp'
  ];

  // This array is kept for backward compatibility
  const availableZips = [
    { name: 'APT Downloader', filename: 'apt-dl.zip' },
    { name: 'Convert Images', filename: 'convert-images.zip' },
    { name: 'ISO Hasher', filename: 'iso-hasher.zip' },
    { name: 'ISO Scanner', filename: 'iso-scanner.zip' },
    { name: 'Mirror Rust Crates', filename: 'mirror-rust-crates.zip' },
    { name: 'Organize Crates', filename: 'organize-crates.zip' }
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, this would be an API call
        const foundProject = projects.find(p => p.id === id);

        // Find the index of the current project in the projects array
        const index = projects.findIndex(p => p.id === id);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!foundProject) {
          throw new Error(`Project with ID "${id}" not found`);
        }

        if (isMounted) {
          setProject(foundProject);
        }

        // Set the current index and slider value
        if (index !== -1) {
          setCurrentIndex(index);
          setSliderValue(index);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load project details'));
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProject();
    }
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCopy = () => {
    if (project) {
      try {
        navigator.clipboard.writeText(project.repoUrl);
        toast({
          title: 'URL Copied!',
          description: `${project.title} repository URL copied to clipboard.`,
          duration: 3000,
        });
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        toast({
          title: 'Copy Failed',
          description: 'Could not copy to clipboard. Please try again.',
          duration: 3000,
        });
      }
    }
  };

  // Navigation functions
  const goToPrevProject = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      navigate(`/project/${projects[prevIndex].id}`);
    }
  };

  const goToNextProject = () => {
    if (currentIndex < projects.length - 1) {
      const nextIndex = currentIndex + 1;
      navigate(`/project/${projects[nextIndex].id}`);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setSliderValue(newValue);
  };

  const handleSliderChangeComplete = () => {
    if (sliderValue !== currentIndex) {
      navigate(`/project/${projects[sliderValue].id}`);
    }
  };

  // Get development status color
  const getStatusColor = () => {
    const status = id ? syncStatuses[id] as 'active' | 'in-progress' | 'archived' | undefined : undefined;

    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'archived':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (): string => {
    const status = id && syncStatuses ? syncStatuses[id] as SyncStatus : undefined;
    
    switch (status) {
      case 'active':
        return 'Active';
      case 'in-progress':
        return 'In Progress';
      case 'archived':
        return 'Archived';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <FallbackError
        error={error}
        message="We couldn't load the project details. Please try again later."
        resetErrorBoundary={() => window.location.reload()}
      />
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <MetaTags
          title="Project Not Found | Portfolio"
          description="The project you're looking for doesn't exist or has been removed from our portfolio."
          canonicalUrl="https://portfolio.example.com/404"
        />
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The project you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          to="/"
          className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
        >
          <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Projects
        </Link>
      </div>
    );
  }

  // Create structured data for the project
  const projectStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    applicationCategory: 'Software',
    url: `https://portfolio.example.com/project/${project.id}`,
    downloadUrl: project.demoUrl || project.websiteUrl,
    softwareVersion: project.version || 'Latest',
    description: project.description,
    image: project.logoSrc || 'https://portfolio.example.com/placeholder.svg',
    logo: project.logoSrc || 'https://portfolio.example.com/placeholder.svg',
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        description: 'Free access',
      },
    ],
    isPartOf: {
      '@type': 'WebSite',
      name: 'Portfolio',
      url: 'https://portfolio.example.com/',
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <MetaTags
        title={`${project.title} - Project | Portfolio`}
        description={`View ${project.title} project details. ${project.description}`}
        keywords={`${project.title}, project, portfolio, software, development`}
        canonicalUrl={`https://portfolio.example.com/project/${project.id}`}
        ogTitle={`${project.title} - Project | Portfolio`}
        ogDescription={`View ${project.title} project details. ${project.description}`}
        ogImage={project.logoSrc || 'https://portfolio.example.com/placeholder.svg'}
        ogImageAlt={`${project.title} logo`}
        twitterTitle={`${project.title} - Project | Portfolio`}
        twitterDescription={`View ${project.title} project details. ${project.description}`}
        twitterImage={project.logoSrc || 'https://portfolio.example.com/placeholder.svg'}
        twitterImageAlt={`${project.title} logo`}
        structuredData={projectStructuredData}
      />
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              >
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-gray-600 dark:text-gray-400 md:ml-2">
                  {project.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Project Navigation Slider */}
      <div className="mb-8 bg-gray-100 dark:bg-[#1a1a1a] p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          Browse Projects
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevProject}
            disabled={currentIndex <= 0}
            className={`p-2 rounded-full ${
              currentIndex <= 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
            } text-white transition-colors`}
            aria-label="Previous project"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={projects.length - 1}
              value={sliderValue}
              onChange={handleSliderChange}
              onMouseUp={handleSliderChangeComplete}
              onKeyUp={handleSliderChangeComplete}
              className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
              aria-label="Project slider"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span>1</span>
              <span>{Math.floor(projects.length / 2)}</span>
              <span>{projects.length}</span>
            </div>
          </div>

          <button
            onClick={goToNextProject}
            disabled={currentIndex >= projects.length - 1}
            className={`p-2 rounded-full ${
              currentIndex >= projects.length - 1
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
            } text-white transition-colors`}
            aria-label="Next project"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
          {currentIndex + 1} of {projects.length}:{' '}
          <span className="font-medium text-green-600 dark:text-green-400">{project.title}</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <div className="relative">
          {project.logoSrc && !imageError ? (
            <img
              src={project.logoSrc}
              width={160}
              height={160}
              alt={`${project.title} logo`}
              className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
              onError={() => {
                // If image fails to load, set error state
                setImageError(true);
              }}
            />
          ) : null}

          {/* Custom placeholder that shows when no logo exists or when loading fails */}
          <div
            className={`logo-placeholder w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${!project.logoSrc || imageError ? 'flex' : 'hidden'}`}
            style={{
              backgroundColor: project.buttonColor?.split(' ')[0] || 'bg-gray-200',
              color: 'white',
            }}
          >
            <span className="text-3xl font-bold">
              {project.title ? project.title.substring(0, 2).toUpperCase() : '??'}
            </span>
          </div>

          <div
            className={`absolute bottom-2 right-2 w-6 h-6 rounded-full ${getStatusColor()} border-2 border-white dark:border-gray-800`}
            title={`Project status: ${getStatusText()}`}
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cyan-600 text-white py-2 px-4 rounded-md text-sm flex items-center justify-center hover:bg-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Website
            </a>

            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white py-2 px-4 rounded-md text-sm flex items-center justify-center hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Live Demo
              </a>
            )}

            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 text-white py-2 px-4 rounded-md text-sm flex items-center justify-center hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Repository
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'overview' ? 'page' : undefined}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'details' ? 'page' : undefined}
          >
            Technical Details
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            aria-current={activeTab === 'gallery' ? 'page' : undefined}
          >
            Gallery
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                About {project.title}
              </h2>
              {project.longDescription ? (
                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                  {project.longDescription.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  {project.title} is a software project that provides innovative solutions. It is designed to be user-friendly and
                  stable, making it a great choice for both beginners and experienced users.
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-300 mt-3">
                The current project status is{' '}
                <span className="font-semibold">{getStatusText()}</span>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                Repository Information
              </h2>
              <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Repository URL</h3>
                <div className="flex justify-between items-center bg-white dark:bg-[#1a1a1a] p-3 rounded-md">
                  <code className="text-green-600 dark:text-green-400 text-sm overflow-x-auto whitespace-nowrap max-w-[calc(100%-2rem)]">
                    {project.repoUrl}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white ml-2"
                    title="Copy URL"
                    aria-label="Copy repository URL"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>

            {/* Download Section */}
            {project.hasDownloads && (
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                  Downloads
                </h2>
                <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Available Downloads</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* New download options */}
                    {project.downloadOptions?.zipToml && (
                      <div className="flex flex-col space-y-2">
                        <a
                          href={project.downloadOptions.zipToml.zipPath}
                          download
                          className="flex items-center p-3 bg-white dark:bg-[#1a1a1a] rounded-md hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                        >
                          <div className="mr-3 text-cyan-600 dark:text-cyan-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">{project.title} (ZIP)</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Source code archive</div>
                          </div>
                        </a>
                        <a
                          href={project.downloadOptions.zipToml.tomlPath.replace('/src/shared/projects/', '/projects/')}
                          download
                          className="flex items-center p-3 bg-white dark:bg-[#1a1a1a] rounded-md hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                        >
                          <div className="mr-3 text-blue-600 dark:text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">{project.title} (TOML)</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Verification file with hashes</div>
                          </div>
                        </a>
                      </div>
                    )}
                    
                    {project.downloadOptions?.torrent && (
                      <a
                        href={project.downloadOptions.torrent.path.replace('/src/shared/projects/', '/projects/')}
                        download
                        className="flex items-center p-3 bg-white dark:bg-[#1a1a1a] rounded-md hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                      >
                        <div className="mr-3 text-green-600 dark:text-green-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">{project.title} (Torrent)</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">BitTorrent download</div>
                        </div>
                      </a>
                    )}
                    
                    {/* Fallback to old availableZips for backward compatibility */}
                    {!project.downloadOptions && availableZips
                      .filter(zip => zip.name.toLowerCase().includes(project.title.toLowerCase()) || 
                                    project.title.toLowerCase().includes(zip.name.toLowerCase()))
                      .map((zip, index) => (
                        <a
                          key={index}
                          href={`/zips/${zip.filename}`}
                          download
                          className="flex items-center p-3 bg-white dark:bg-[#1a1a1a] rounded-md hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                        >
                          <div className="mr-3 text-cyan-600 dark:text-cyan-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">{zip.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{zip.filename}</div>
                          </div>
                        </a>
                      ))
                    }
                  </div>
                </div>
              </section>
            )}

            {(project.minimumRequirements || project.recommendedRequirements) && (
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                  System Requirements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.minimumRequirements && (
                    <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                      <h3 className="text-lg font-medium mb-2">Minimum Requirements</h3>
                      <p className="text-gray-600 dark:text-gray-300">{project.minimumRequirements}</p>
                    </div>
                  )}
                  {project.recommendedRequirements && (
                    <div className="bg-gray-100 dark:bg-[#0a0a0a] p-4 rounded-md">
                      <h3 className="text-lg font-medium mb-2">Recommended Requirements</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {project.recommendedRequirements}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                Technical Details
              </h2>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-2">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {project.languages && project.languages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-2">Programming Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Frameworks */}
              {project.frameworks && project.frameworks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-2">Frameworks</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.frameworks.map((framework, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
                      >
                        {framework}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {project.features && project.features.length > 0 && (
                <div>
                  <h3 className="text-xl font-medium mb-2">Key Features</h3>
                  <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                    {project.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400">
                {project.title} Gallery
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Screenshots of {project.title} in action.
              </p>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {placeholderImages.map((image, index) => (
                  <div key={index} className="bg-gray-100 dark:bg-[#0a0a0a] p-2 rounded-md overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${project.title} screenshot ${index + 1}`} 
                      className="w-full h-48 object-cover rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                    />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                      {project.title} - Screenshot {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;