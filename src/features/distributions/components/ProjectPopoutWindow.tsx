import { useEffect, useState } from 'react';
import { X, ExternalLink, FileDown, Copy } from './icons';
import { useToast } from '../hooks/useToast';
import {
  fetchProjectFiles,
  getProjectDownloads,
  getFilenameFromPath,
  getDirectDownloadUrl
} from './path-to-source';

/**
 * Interface representing a project
 *
 * @interface Project
 * @property {string} id - Unique identifier for the project
 * @property {string} title - Name of the project
 * @property {string} description - Short description of the project
 * @property {string} logoSrc - URL to the project's logo image
 * @property {string} websiteUrl - URL to the project's official website
 * @property {string} repoUrl - URL to the project's repository
 * @property {string} [demoUrl] - Optional URL to the project's demo
 * @property {string} [aboutText] - Optional detailed description of the project
 * @property {number} [releaseYear] - Optional year when the project was first released
 */
interface Project {
  id: string;
  title: string;
  description: string;
  logoSrc: string;
  websiteUrl: string;
  repoUrl: string;
  demoUrl?: string;
  aboutText?: string;
  releaseYear?: number;
  hasDownloads?: boolean;
}

/**
 * Interface for the properties of the ProjectPopoutWindow component
 *
 * @interface ProjectPopoutWindowProps
 * @property {Project} project - The project to display in the window
 * @property {() => void} onClose - Function to call when the window is closed
 */
interface ProjectPopoutWindowProps {
  project: Project;
  onClose: () => void;
}

/**
 * Interface for a downloadable file
 */
interface DownloadFile {
  path: string;
  size: string;
  type: string;
}

/**
 * ProjectPopoutWindow Component
 *
 * A window component that displays detailed information about a project.
 * Includes the project's logo, name, description, website link, demo link,
 * repository URL, and a list of available downloads. The window can be closed by pressing ESC
 * or clicking the close button.
 *
 * @param {ProjectPopoutWindowProps} props - The properties for the ProjectPopoutWindow component
 * @returns {JSX.Element} The window component
 */
const ProjectPopoutWindow = ({ project, onClose }: ProjectPopoutWindowProps) => {
  const { toast } = useToast();
  const [downloadFiles, setDownloadFiles] = useState<DownloadFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Effect hook to fetch download data and handle ESC key press
   * Loads download data when component mounts and sets up event listener for ESC key
   */
  useEffect(() => {
    /**
     * Fetches download data for the current project
     *
     * @async
     * @function loadDownloadData
     * @returns {Promise<void>} Nothing
     */
    const loadDownloadData = async () => {
      setIsLoading(true);
      try {
        if (project.hasDownloads) {
          const data = await fetchProjectFiles();
          const files = getProjectDownloads(data, project.id);
          setDownloadFiles(files);
        } else {
          setDownloadFiles([]);
        }
      } catch (error) {
        console.error('Error loading download data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDownloadData();

    /**
     * Event handler for keyboard events to close window on ESC key press
     *
     * @param {KeyboardEvent} e - The keyboard event
     */
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [project.id, project.hasDownloads, onClose]);

  /**
   * Copies the repository URL to the clipboard and shows a toast notification
   *
   * @returns {void}
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(project.repoUrl);
    toast({
      title: 'URL Copied!',
      description: `${project.title} repository URL copied to clipboard.`,
      duration: 3000,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 animate-fadeIn">
      <div
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl w-full max-w-5xl overflow-hidden shadow-2xl animate-scaleIn border-2 border-cyan-500/30"
        style={{ minHeight: '300px', maxHeight: '90vh' }}
      >
        {/* Close button - absolute positioned in the top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-black/40 rounded-full p-1 hover:bg-black/60"
          aria-label="Close window"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content - flex layout */}
        <div className="flex flex-col md:flex-row h-full">
          {/* Left side - Logo and basic info */}
          <div className="w-full md:w-1/3 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a]/80 to-transparent md:border-r border-cyan-500/20">
            <img
              src={project.logoSrc || '/placeholder.svg'}
              width={192}
              height={192}
              alt={`${project.title} logo`}
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full mb-4 md:mb-6 shadow-lg shadow-cyan-500/20 object-cover"
            />
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
              {project.title}
            </h2>
            {project.releaseYear && (
              <p className="text-cyan-400 text-base md:text-lg">Est. {project.releaseYear}</p>
            )}

            <div className="mt-4 md:mt-6 flex gap-3 md:gap-4">
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-600 text-white py-1.5 md:py-2 px-3 md:px-4 rounded-md text-sm flex items-center justify-center hover:bg-cyan-700 transition-all duration-200 shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                Website
              </a>

              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white py-1.5 md:py-2 px-3 md:px-4 rounded-md text-sm flex items-center justify-center hover:bg-green-700 transition-all duration-200 shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                  Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Right side - Details and features */}
          <div
            className="w-full md:w-2/3 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[60vh] md:max-h-[70vh]"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(6, 182, 212, 0.2) transparent' }}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-cyan-400 mb-3 border-b border-cyan-500/30 pb-2">
                  About
                </h3>
                <p className="text-gray-200 text-lg leading-relaxed">{project.description}</p>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  {project.aboutText ||
                    `${project.title} is a software project that provides innovative solutions. For more information, visit the official website.`}
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-cyan-400 mb-3 border-b border-cyan-500/30 pb-2">
                  Repository
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  The source code for this project is available in the repository below. Feel free to contribute, report issues, or fork the project.
                </p>

                <div className="mt-4 bg-[#0a0a0a] p-4 rounded-md border border-cyan-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-cyan-400">Repository URL</h4>
                    <button
                      onClick={handleCopy}
                      className="text-gray-400 hover:text-white bg-[#1a1a1a] p-1 rounded hover:bg-[#252525] transition-colors"
                      title="Copy URL"
                      aria-label="Copy repository URL"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  <code className="text-green-400 text-sm block overflow-x-auto whitespace-nowrap p-2 bg-black/50 rounded">
                    {project.repoUrl}
                  </code>
                </div>
              </div>

              {/* Downloads Section */}
              {project.hasDownloads && (
                <div>
                  <h3 className="text-2xl font-bold text-cyan-400 mb-3 border-b border-cyan-500/30 pb-2">
                    Available Downloads
                  </h3>

                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500" />
                    </div>
                  ) : downloadFiles.length > 0 ? (
                    <ul className="space-y-4">
                      {downloadFiles.map((file, index) => (
                        <li
                          key={index}
                          className="bg-[#0a0a0a] p-4 rounded-md border border-cyan-500/20"
                        >
                          <div className="font-semibold text-white mb-2">
                            {getFilenameFromPath(file.path)}{' '}
                            <span className="text-cyan-400">({file.size})</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={getDirectDownloadUrl(file.path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-600 text-white py-1 px-3 rounded text-sm flex items-center hover:bg-green-700 transition-all"
                            >
                              <FileDown className="w-3.5 h-3.5 mr-1.5" />
                              Download
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-300">No download files found for this project.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPopoutWindow;