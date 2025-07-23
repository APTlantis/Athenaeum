/**
 * Functions for handling project files and downloads
 */

/**
 * Fetches project files from the server
 * 
 * @returns {Promise<any>} A promise that resolves to the project files data
 */
export const fetchProjectFiles = async (): Promise<any> => {
  try {
    // In a real app, this would be an API call to fetch project files
    // For now, we'll return a mock response
    return {
      files: [
        {
          path: 'tinyllama/model.bin',
          size: '1.2 GB',
          type: 'binary'
        },
        {
          path: 'tinyllama/dataset.zip',
          size: '800 MB',
          type: 'archive'
        },
        {
          path: 'tinyllama/documentation.pdf',
          size: '5 MB',
          type: 'document'
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching project files:', error);
    throw error;
  }
};

/**
 * Gets download files for a specific project
 * 
 * @param {any} data - The data containing all project files
 * @param {string} projectId - The ID of the project to get downloads for
 * @returns {Array<{path: string, size: string, type: string}>} An array of download files
 */
export const getProjectDownloads = (data: any, projectId: string): Array<{path: string, size: string, type: string}> => {
  if (!data || !data.files) {
    return [];
  }
  
  // Filter files by project ID (files should have the project ID as a prefix in their path)
  return data.files.filter((file: any) => file.path.startsWith(`${projectId}/`));
};

/**
 * Gets the filename from a file path
 * 
 * @param {string} path - The file path
 * @returns {string} The filename
 */
export const getFilenameFromPath = (path: string): string => {
  // Split the path by '/' and get the last part
  const parts = path.split('/');
  return parts[parts.length - 1];
};

/**
 * Gets the direct download URL for a file
 * 
 * @param {string} path - The file path
 * @returns {string} The direct download URL
 */
export const getDirectDownloadUrl = (path: string): string => {
  // In a real app, this would construct a URL to the file on the server
  // For now, we'll just return a mock URL
  return `/api/download/${encodeURIComponent(path)}`;
};