import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ProjectPage from './pages/ProjectPage'
import NotFoundPage from './pages/NotFoundPage'

// App decides which page to show based on the URL.
//
// The outer <Route> uses Layout for every page (the header with the links).
// The inner routes fill the space Layout leaves with its <Outlet />:
//   /                -> HomePage
//   /dashboard       -> DashboardPage
//   /projects/:id    -> ProjectPage (":id" is a URL parameter, e.g. /projects/abc123)
//   anything else    -> NotFoundPage
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects/:id" element={<ProjectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
