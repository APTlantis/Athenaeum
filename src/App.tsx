                                              import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { HomePage } from './features/home';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { SyncStatusProvider } from './context/SyncStatusContext';
import { ToastProvider } from './hooks/useToast';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

// Lazy load non-critical pages for better performance
const ProjectDetailPage = lazy(() =>
  import('./features/projects').then(module => ({ default: module.ProjectDetailPage }))
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <SyncStatusProvider>
              <Router>
                <div className="flex flex-col min-h-screen bg-[#121212] text-white">
                  <Header />
                  <main className="flex-grow">
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/project/:id" element={<ProjectDetailPage />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </main>
                  <Footer />
                </div>
              </Router>
          </SyncStatusProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
