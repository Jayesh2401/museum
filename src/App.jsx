import { useEffect, useState } from 'react'
import ClassicScene from './pages/ClassicScene'
import AdvancedMuseum from './pages/AdvancedMuseum'
import Second from './pages/Second'
import FiberWall from './pages/FiberWall'
import SpaceMuseum from './pages/SpaceMuseum'
import PortalMuseum from './pages/PortalMuseum'
import ImmersiveMuseum from './pages/ImmersiveMuseum'
import BlackHolePortalMuseum from './pages/BlackHolePortalMuseum'

function HomeRoutes() {
  return (
    <div className="route-home">
      <div className="route-card">
        <h1>Museum Scenes</h1>
        <p>Select a route to open the scene.</p>
        <div className="route-list">
          <a href="#/classic">Classic Scene</a>
          <a href="#/advanced-museum">Advanced Museum</a>
          <a href="#/space-museum">Space Museum</a>
          <a href="#/portal-museum">Portal Museum</a>
          <a href="#/black-hole-portal-museum">Black Hole Portal Museum</a>
          <a href="#/immersive-museum">Immersive Museum</a>
          <a href="#/second">Second</a>
          <a href="#/fiber-wall">Fiber Wall</a>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [hashRoute, setHashRoute] = useState(window.location.hash || '#/')

  useEffect(() => {
    const onHashChange = () => setHashRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (hashRoute === '#/classic') return <ClassicScene />
  if (hashRoute === '#/advanced-museum') return <AdvancedMuseum />
  if (hashRoute === '#/space-museum') return <SpaceMuseum />
  if (hashRoute === '#/portal-museum') return <PortalMuseum />
  if (hashRoute === '#/black-hole-portal-museum') return <BlackHolePortalMuseum />
  if (hashRoute === '#/immersive-museum') return <ImmersiveMuseum />
  if (hashRoute === '#/second') return <Second />
  if (hashRoute === '#/fiber-wall') return <FiberWall />
  return <HomeRoutes />
}
