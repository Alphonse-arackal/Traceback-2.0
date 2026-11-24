import Header from './Header'
import Sidebar from './Sidebar'

export default function MainLayout({ children, search, setSearch }) {
  return (
    <div className="app-shell">
      <Header search={search} setSearch={setSearch} />
      <div className="app-body">
        <Sidebar />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}
