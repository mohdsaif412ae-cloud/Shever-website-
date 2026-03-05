import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const WhatsAppFloat = () => {
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await axios.get(`${API}/contact-info`);
        setWhatsapp(response.data.whatsapp);
      } catch (error) {
        console.error('Error fetching WhatsApp number:', error);
      }
    };
    fetchContact();
  }, []);

  if (!whatsapp) return null;

  const handleClick = () => {
    window.open(`https://wa.me/${whatsapp}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      data-testid="whatsapp-float-button"
      className="whatsapp-float"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  );
};