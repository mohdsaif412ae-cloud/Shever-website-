import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Footer = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [logo, setLogo] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactRes, logoRes] = await Promise.all([
          axios.get(`${API}/contact-info`),
          axios.get(`${API}/site-settings`)
        ]);
        setContactInfo(contactRes.data);
        if (logoRes.data.logo_path) {
          setLogo(`${BACKEND_URL}${logoRes.data.logo_path}`);
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
      }
    };
    fetchData();
  }, []);

  if (!contactInfo) return null;

  return (
    <footer className="bg-primary text-white py-16" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company Info */}
          <div>
            {logo ? (
              <img src={logo} alt="Shever Technical" className="h-12 w-auto mb-4" style={{ filter: 'brightness(0) invert(1)' }} />
            ) : (
              <h3 className="text-2xl font-bold mb-4">Shever Technical</h3>
            )}
            <p className="text-gray-300 mb-4">
              Professional technical and maintenance services in UAE. Your trusted partner for HVAC, Electrical, Plumbing, and more.
            </p>
            <p className="text-sm text-gray-400">TRN: {contactInfo.trn}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" data-testid="footer-link-home" className="text-gray-300 hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" data-testid="footer-link-services" className="text-gray-300 hover:text-accent transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/projects" data-testid="footer-link-projects" className="text-gray-300 hover:text-accent transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/about" data-testid="footer-link-about" className="text-gray-300 hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" data-testid="footer-link-contact" className="text-gray-300 hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                <div>
                  <a href={`tel:${contactInfo.phone}`} data-testid="footer-phone" className="text-gray-300 hover:text-accent transition-colors">
                    {contactInfo.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                <div>
                  <a href={`mailto:${contactInfo.email}`} data-testid="footer-email" className="text-gray-300 hover:text-accent transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">{contactInfo.address}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Shever Technical. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};