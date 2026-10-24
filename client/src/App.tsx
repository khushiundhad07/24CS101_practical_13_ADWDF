import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import PageFallback from './components/PageFallback';
import Delayed from './components/Delayed';
import ThemeToggle from './components/ThemeToggle';
import AccountMenu from './components/AccountMenu';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';
import Home from './pages/Home';
import { contacts, profile } from './data/profile';

// Home is the first page most visitors see, so it stays in the main bundle.
// Every other page becomes its own chunk, downloaded only when its route is visited.
// React.lazy needs a default export, which each page file has.
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Login = lazy(() => import('./pages/Login'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="mx-auto w-[min(1040px,100%-32px)]">
          <NavBar>
            <div className="flex items-center gap-2">
              <AccountMenu />
              <ThemeToggle />
            </div>
          </NavBar>
          {/* Suspense wraps only the routes, so the nav and footer stay on screen while a page loads. */}
          <Suspense
            fallback={
              <Delayed>
                <PageFallback />
              </Delayed>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route
                path="/tasks"
                element={
                  <RequireAuth>
                    <Tasks />
                  </RequireAuth>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Footer name={profile.name} links={contacts} />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
