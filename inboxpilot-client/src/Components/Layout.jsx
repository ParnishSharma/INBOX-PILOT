import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import '../index.css';
const items=[
  { path: '/dashboard',label: 'Dashboard'},
  
  {path: '/rollup', label: 'Rollup'},
  {path: '/labels', label: 'Labels'},
  {path: '/settings', label: 'Settings'}
  
];

function Layout() {
  const[user, setUser] = useState(null);

  useEffect(()=>{
    const data = JSON.parse(localStorage.getItem('user'));
    setUser(data);
  }, [] ) 
   

  return (
   <div className="min-h-screen flex flex-col lg:flex-row">
  {/* Sidebar */}
  <aside className="w-full lg:w-64 bg-gray-800 text-white p-4 lg:h-screen">
    <h1 className="text-4xl font-Lacquer bg-amber-100 rounded-4xl text-center text-amber-900 font-bold mb-5">
      Inbox Pilot
    </h1>
    <nav className="flex flex-col text-xl gap-2">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="block py-1 px-4 hover:bg-gray-700 rounded-3xl transition text-amber-100"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  </aside>

  {/* Main Content */}
  <div className="flex-1 flex flex-col">
    <header className="bg-white flex h-12 justify-end items-center px-5 shadow-sm">
      {user && (
        <span className="text-lg md:text-xl text-gray-600">
          {user.displayName || 'User'}
        </span>
      )}
    </header>
    <main className="flex-1 p-4 overflow-y-auto">
      <Outlet />
    </main>
    <footer className="bg-gray-800 text-white text-center py-4">
      <p className="text-sm">© 2023 Inbox Pilot. All rights reserved.</p>
      <p>Made with ❤️ by Parnish</p>
    </footer>
  </div>
  </div>


  )
}

export default Layout;
