import { NavLink } from 'react-router-dom'
import { CirclePlus, ClipboardList, Home, MapPinned, UserRound, MapPin } from 'lucide-react'

const links = [
  ['Home', '/', Home],
  ['Explore', '/explore', MapPinned],
  ['Report', '/report', CirclePlus],
  ['My Reports', '/reports', ClipboardList],
  ['Profile', '/profile', UserRound],
]

function NavigationLinks({ mobile = false }) {
  return links.map(([label, path, Icon]) => (
    <NavLink key={path} to={path} end={path === '/'} aria-label={label} title={label}
      className={({ isActive }) => `${mobile ? 'mobile-nav-link' : 'side-link'} ${isActive ? 'active' : ''}`}>
      <Icon size={20} /><span>{label}</span>
    </NavLink>
  ))
}
export default function Sidebar() {
  return <>
    <aside className="sidebar">
      <div><div className="menu-label">MENU</div><nav className="side-nav"><NavigationLinks /></nav></div>
      <div className="sidebar-bottom"><div className="sidebar-note"><b><MapPin size={16} /> TraceBack</b><p>Helping people reconnect with their lost belongings.</p></div></div>
    </aside>
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation"><NavigationLinks mobile /></nav>
  </>
}
