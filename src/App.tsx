import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Home from './pages/Home';
import ModulePage from './pages/ModulePage';
import TeacherPage from './pages/TeacherPage';
import MoodleSettingsPage from './pages/MoodleSettingsPage';
import { ROUTE_PATHS } from './lib/index';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Router>
        <Routes>
          <Route path={ROUTE_PATHS.HOME} element={<Home />} />
          <Route path="/module/:moduleId" element={<ModulePage />} />
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/moodle-settings" element={<MoodleSettingsPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
