import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] py-8 border-t border-green-500/30 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-white">Aptlantis</h2>
            <p className="text-sm text-green-400">Project hub, dashboard, and downloads.</p>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-sm">
          <Link
              to="/terms"
              className="text-gray-300 hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] rounded-md transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-gray-300 hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] rounded-md transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>© {currentYear} Aptlantis. All rights reserved.</p>
          <p className="mt-1">Providing reliable mirrors for Linux distributions.</p>
          <p className="mt-1">Proudly hosted on <a href="https://www.hetzner.com/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">Hetzners</a> network.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
