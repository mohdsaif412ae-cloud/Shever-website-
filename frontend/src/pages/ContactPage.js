import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ContactPage = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service_required: '',
    message: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactRes, servicesRes] = await Promise.all([
          axios.get(`${API}/contact-info`),
          axios.get(`${API}/services`)
        ]);
        setContactInfo(contactRes.data);
        setServices(servicesRes.data);
      } catch (error) {
        console.error('Error fetching contact data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/contact-submissions`, formData);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        service_required: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send message. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="contact-page" className="min-h-screen">
      {/* Header */}
      <section className="bg-primary text-white py-32 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Get in touch with our team for a free consultation and quote. We're here to help with all your technical and maintenance needs.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-8">Get In Touch</h2>
              
              {contactInfo && (
                <div className="space-y-6 mb-12">
                  <div className="flex items-start gap-4" data-testid="contact-phone">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Phone / WhatsApp</h3>
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="text-lg text-muted-foreground hover:text-accent transition-colors"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4" data-testid="contact-email">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Email</h3>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-lg text-muted-foreground hover:text-accent transition-colors"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4" data-testid="contact-address">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Address</h3>
                      <p className="text-lg text-muted-foreground">{contactInfo.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Business Hours</h3>
                      <p className="text-lg text-muted-foreground">24/7 Emergency Service Available</p>
                      <p className="text-muted-foreground">Mon - Sat: 8:00 AM - 8:00 PM</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="rounded-xl overflow-hidden shadow-lg" data-testid="contact-map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.3076087842835!2d55.334564!3d25.269108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5ce6d1d1c1b1%3A0x1f1f1f1f1f1f1f1f!2sAl%20Khabeesi%2C%20Dubai!5e0!3m2!1sen!2sae!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shever Technical Location"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-muted rounded-xl p-8">
                <h2 className="text-3xl font-bold text-primary mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} data-testid="contact-form">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        data-testid="contact-form-name"
                        className="w-full h-12 rounded-lg border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        data-testid="contact-form-phone"
                        className="w-full h-12 rounded-lg border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="+971 XX XXX XXXX"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        data-testid="contact-form-email"
                        className="w-full h-12 rounded-lg border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="service_required" className="block text-sm font-medium text-foreground mb-2">
                        Service Required *
                      </label>
                      <select
                        id="service_required"
                        name="service_required"
                        value={formData.service_required}
                        onChange={handleChange}
                        required
                        data-testid="contact-form-service"
                        className="w-full h-12 rounded-lg border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Select a service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.name}>
                            {service.name}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        data-testid="contact-form-message"
                        className="w-full rounded-lg border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Tell us about your requirements..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      data-testid="contact-form-submit"
                      className="w-full bg-accent text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-accent/90 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
