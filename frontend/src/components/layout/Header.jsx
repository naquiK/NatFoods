// components/Header.jsx
"use client"

import React, { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingBag, User, Menu, X, Sun, Moon, LogOut, ArrowRight } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { useSettings } from "../../context/SettingsContext"
import { useTheme } from "../../context/ThemeContext"
import logo from "../../assets/logo.jpg"
import { productsAPI } from "../../utils/api"

// --- Main Header Component ---
const Header = () => {
    const [isPortalOpen, setIsPortalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const location = useLocation();
    useEffect(() => {
        setIsPortalOpen(false);
        setIsSearchOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = isPortalOpen ? "hidden" : "auto";
    }, [isPortalOpen]);

    return (
        <>
            <DesktopKineticHeader onSearchOpen={() => setIsSearchOpen(true)} />
            
            <MobileHeaderBar
                isPortalOpen={isPortalOpen}
                onMenuToggle={() => setIsPortalOpen(!isPortalOpen)}
            />
            <ContentPortal
                isOpen={isPortalOpen}
                setIsOpen={setIsPortalOpen}
            />

            <SearchPalette
                isOpen={isSearchOpen}
                setIsOpen={setIsSearchOpen}
            />
        </>
    );
};


// --- Desktop: The Kinetic Bar Component ---
const DesktopKineticHeader = ({ onSearchOpen }) => {
    const { user } = useAuth();
    const { cartItems } = useCart();
    const { settings } = useSettings();
    const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const location = useLocation();

    const navigation = [
        { name: "Home", href: "/" },
        { name: "Products", href: "/products" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 30, delay: 0.2 }}
            className="hidden lg:block fixed top-0 left-0 right-0 z-50"
        >
            <div className="container-max mx-auto px-8 py-4">
                <div className="w-full bg-foreground/80 backdrop-blur-xl rounded-2xl shadow-lg border border-border flex items-center justify-between h-16 px-6">
                    <Link to="/">
                        <img src={settings?.logo?.url || logo} alt="Logo" className="h-9 w-auto" />
                    </Link>

                    <nav className="flex items-center gap-2">
                        {navigation.map((item) => (
                            <KineticLink 
                                key={item.name} 
                                href={item.href} 
                                label={item.name}
                                isActive={location.pathname === item.href}
                            />
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <button onClick={onSearchOpen} className="p-2.5 rounded-full hover:bg-muted text-secondary hover:text-primary">
                            <Search size={20} />
                        </button>
                        <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-muted text-secondary hover:text-primary">
                            <ShoppingBag size={20} />
                            {cartItemsCount > 0 && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />}
                        </Link>
                        <Link to={user ? "/profile" : "/login"} className="p-2.5 rounded-full hover:bg-muted text-secondary hover:text-primary">
                            {user ? (
                                <img src={user.profilePicture?.url || "/placeholder-user.jpg"} alt="Profile" className="h-6 w-6 rounded-full object-cover"/>
                            ) : (
                                <User size={20} />
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

// Helper for the kinetic text effect on desktop
const KineticLink = ({ href, label, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);

    const letterVariants = {
        rest: { y: 0 },
        hover: { y: -4, transition: { type: 'spring', stiffness: 300, damping: 10 } },
    };

    return (
        <Link 
            to={href} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative block px-4 py-2 text-sm font-semibold text-secondary"
        >
            <motion.span 
                className="flex"
                initial="rest"
                animate={isHovered ? "hover" : "rest"}
                variants={{
                    hover: { transition: { staggerChildren: 0.05 } }
                }}
            >
                {label.split("").map((char, i) => (
                    <motion.span key={i} variants={letterVariants} className="inline-block">
                        {char}
                    </motion.span>
                ))}
            </motion.span>
            {(isHovered || isActive) && (
                <motion.div
                    layoutId="underline"
                    className="absolute bottom-1 left-0 right-0 h-0.5 bg-accent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            )}
        </Link>
    );
};

// --- Mobile Header Bar ---
const MobileHeaderBar = ({ isPortalOpen, onMenuToggle }) => {
    const { settings } = useSettings();
    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 h-20 bg-background/80 backdrop-blur-sm">
            <Link to="/">
                <img src={settings?.logo?.url || logo} alt="Logo" className="h-9 w-auto" />
            </Link>
            <button
                onClick={onMenuToggle}
                className="w-14 h-14 flex items-center justify-center"
                aria-label="Toggle menu"
            >
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={isPortalOpen ? 'close' : 'open'}
                        initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isPortalOpen ? <X size={24} /> : <Menu size={24} />}
                    </motion.div>
                </AnimatePresence>
            </button>
        </div>
    );
};

// --- Mobile Portal Component ---
const ContentPortal = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [featuredProducts, setFeaturedProducts] = useState([]);

    useEffect(() => {
        if (isOpen && featuredProducts.length === 0) {
            productsAPI.getAll({ limit: 4, sort: '-sold' })
                .then(res => setFeaturedProducts(res.data.products || []))
                .catch(console.error);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: "0%" }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="lg:hidden fixed inset-0 bg-neutral-100 dark:bg-neutral-900 z-40 flex flex-col p-6 pt-24 overflow-y-auto"
                >
                    <motion.div 
                        className="flex-1 flex flex-col justify-center gap-4"
                        initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 }} }}
                    >
                        <motion.div variants={{hidden:{opacity:0, y:20}, visible:{opacity:1, y:0}}}>
                            <Link to="/" className="block relative w-full h-48 bg-neutral-200 dark:bg-neutral-800 rounded-2xl overflow-hidden p-6 flex flex-col justify-end text-white">
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                 <img src={logo} alt="Go to Homepage" className="absolute inset-0 w-full h-full object-cover"/>
                                 <h3 className="relative z-20 text-4xl font-extrabold">Home</h3>
                            </Link>
                        </motion.div>
                        
                        <motion.div variants={{hidden:{opacity:0, y:20}, visible:{opacity:1, y:0}}} className="w-full bg-white dark:bg-black rounded-2xl p-6">
                            <Link to="/products" className="flex items-center justify-between mb-4">
                               <h3 className="text-2xl font-bold">Products</h3>
                               <ArrowRight/>
                            </Link>
                            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6">
                                {featuredProducts.length > 0 ? featuredProducts.map(p =>  (
                                    <Link to={`/products/${p._id}`} key={p._id} className="flex-shrink-0 w-32">
                                        <div className="w-full h-32 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                                            <img src={p.images?.[0]?.url || '/placeholder-product.jpg'} alt={p.name} className="w-full h-full object-cover"/>
                                        </div>
                                        <p className="text-sm font-semibold mt-2 truncate">{p.name}</p>
                                    </Link>
                                )) : Array.from({length: 4}).map((_, i) => (
                                    <div key={i} className="flex-shrink-0 w-32 animate-pulse">
                                         <div className="w-full h-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg"/>
                                         <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded mt-2"/>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* === FIX: USER ACTION BUTTONS ADDED HERE === */}
                    <div className="flex items-center justify-between pt-6 mt-8 border-t border-neutral-200 dark:border-neutral-700">
                         <div className="flex items-center gap-4 text-lg font-semibold">
                            <Link to="/about">About</Link>
                            <Link to="/contact">Contact</Link>
                         </div>
                         <div className="flex items-center gap-2">
                            <button onClick={toggleTheme} className="p-3 rounded-full bg-neutral-200 dark:bg-neutral-800" aria-label="Toggle theme">
                                <Sun className="dark:hidden"/><Moon className="hidden dark:block"/>
                            </button>
                            {user ? (
                                <>
                                    <Link to="/profile" className="p-3 rounded-full bg-neutral-200 dark:bg-neutral-800" aria-label="Profile">
                                        <User size={20} />
                                    </Link>
                                    <button onClick={logout} className="p-3 rounded-full bg-neutral-200 dark:bg-neutral-800" aria-label="Logout">
                                        <LogOut size={20} />
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="p-3 rounded-full bg-neutral-200 dark:bg-neutral-800" aria-label="Login">
                                    <User size={20} />
                                </Link>
                            )}
                         </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Reusable Search Palette ---
const SearchPalette = ({ isOpen, setIsOpen }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    };

    useEffect(() => {
        if (!isOpen) { setSearchQuery(""); return; }
        const q = searchQuery.trim();
        if (q.length < 2) { setSuggestions([]); return; }
        const timer = setTimeout(async () => {
            try {
                const res = await productsAPI.getAll({ search: q, limit: 5 });
                setSuggestions(res.data.products || []);
            } catch { setSuggestions([]); }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, isOpen]);

     return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
                    <motion.div
                        initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20 }}
                        transition={{ duration: 0.3, ease: 'circOut' }} onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-xl bg-foreground rounded-2xl shadow-2xl border border-border">
                        <form onSubmit={handleSearch}>
                            <div className="relative border-b border-border">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent py-5 pl-14 pr-6 text-lg placeholder:text-text-muted focus:outline-none" autoFocus/>
                            </div>
                        </form>
                        {suggestions.length > 0 && (
                            <div className="p-2">
                                {suggestions.map((s) => (
                                    <button key={s._id} type="button"
                                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted flex items-center justify-between"
                                        onClick={() => navigate(`/products/${s._id}`)}>
                                        <span className="font-semibold">{s.name}</span>
                                        <ArrowRight className="text-text-muted" size={16} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
     );
};

export default Header;