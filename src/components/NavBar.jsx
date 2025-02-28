import { Link } from 'react-router-dom'
import { ShoppingBasket, Store, Tag, Github } from 'lucide-react'
import supabase from '../utils/supabase.js'

export default function NavBar({ session }) {
    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <nav className="bg-gray-800 text-white shadow-md">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2">
                        <ShoppingBasket size={24} />
                        {window.innerWidth >= 500 ? <span className="text-xl font-bold">Цени-У-Магазините</span> : <span className="text-xl font-bold">Ц.У.М</span>}
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link to="/products" className="flex items-center space-x-1 hover:text-indigo-200 transition-colors">
                            <Tag size={18} />
                            {window.innerWidth >= 500 && <span>Продукти</span>}
                        </Link>
                        <Link to="/shops" className="flex items-center space-x-1 hover:text-indigo-200 transition-colors">
                            <Store size={18} />
                            {window.innerWidth >= 500 && <span>Магазини</span>}
                        </Link>
                        <a href="https://github.com/GreeningSiren/ceni-u-magazinite/" className="flex items-center space-x-1 hover:text-indigo-200 transition-colors">
                            <Github size={18} />
                        </a>
                        {session ? (
                            <>
                                {/* <span>Здравей {session.user.email}</span> */}
                                <button className="bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-700" onClick={handleLogout}>
                                    Изход
                                </button>
                            </>
                        ) : (

                            <Link to="/login" className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-700">
                                Вход
                            </Link>

                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

import PropTypes from 'prop-types'
NavBar.propTypes = {
    session: PropTypes.object,
}