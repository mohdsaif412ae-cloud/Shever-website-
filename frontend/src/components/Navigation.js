import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logo, setLogo] = useState('');
  const [contactInfo, setContactInfo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logoRes, contactRes] = await Promise.all([
          axios.get(`${API}/site-settings`),
          axios.get(`${API}/contact-info`)
        ]);
        if (logoRes.data.logo_path) {
          setLogo(`${BACKEND_URL}${logoRes.data.logo_path}`);
        }
        setContactInfo(contactRes.data);
      } catch (error) {
        console.error('Error fetching navigation data:', error);
      }
    };
    fetchData();
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      data-testid="main-navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" data-testid="logo-link">
            {logo ? (
              <div className="bg-white px-3 py-1 rounded-lg shadow-sm">
                <img 
                  src={logo} 
                  alt="Shever Technical" 
                  className="h-12 w-auto"
                  style={{ maxWidth: '180px' }}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-accent rounded-lg"></div>
                <span className="text-xl font-bold text-white">Shever Technical</span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-link-${link.name.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === link.path
                    ? 'text-accent'
                    : isScrolled
                    ? 'text-primary'
                    : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {contactInfo && (
              <a
                href={`tel:${contactInfo.phone}`}
                data-testid="nav-call-button"
                className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full font-medium hover:bg-accent/90 transition-all duration-300 hover:scale-105"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? (
              <X className={isScrolled ? 'text-primary' : 'text-white'} />
            ) : (
              <Menu className={isScrolled ? 'text-primary' : 'text-white'} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 bg-white rounded-b-lg shadow-lg" data-testid="mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`mobile-nav-link-${link.name.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm font-medium transition-colors hover:bg-muted ${
                  location.pathname === link.path ? 'text-accent bg-muted' : 'text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {contactInfo && (
              <a
                href={`tel:${contactInfo.phone}`}
                data-testid="mobile-call-button"
                className="block mx-4 mt-4 text-center bg-accent text-white px-6 py-3 rounded-full font-medium"
              >
                Call Now
              </a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};