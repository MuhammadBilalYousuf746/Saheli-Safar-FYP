import { Navigate, Route, Routes } from 'react-router'
import { pages, legacyRoutes } from './routes.js'
import Layout from './components/layout/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import PassengersPage from './pages/PassengersPage.jsx'
import DriversPage from './pages/DriversPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={pages.home.path} element={<HomePage />} />
        <Route path={pages.passengers.path} element={<PassengersPage />} />
        <Route path={pages.drivers.path} element={<DriversPage />} />
        <Route path={pages.about.path} element={<AboutPage />} />
        <Route path={pages.contact.path} element={<ContactPage />} />
        {legacyRoutes.map(({ path, to }) => <Route key={path} path={path} element={<Navigate to={to} replace />} />)}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
