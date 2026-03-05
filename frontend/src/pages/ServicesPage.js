import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wind,
  Zap,
  Droplet,
  PaintBucket,
  Layers,
  Hammer,
  Shield,
  CalendarCheck,
  AlertCircle,
  CheckCircle,
  Phone
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const iconMap = {
  wind: Wind,
  zap: Zap,
  droplet: Droplet,
  'paint-bucket': PaintBucket,
  layers: Layers,
  hammer: Hammer,
  shield: Shield,
  'calendar-check': CalendarCheck,
  'alert-circle': AlertCircle,
  wrench: Hammer
};

export const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, contactRes] = await Promise.all([
          axios.get(`${API}/services`),
          axios.get(`${API}/contact-info`)
        ]);
        setServices(servicesRes.data);
        setContactInfo(contactRes.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Scroll to service if hash is present
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [services]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="services-page" className="min-h-screen">
      {/* Header */}
      <section className="bg-primary text-white py-32 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Our Services
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Comprehensive technical and maintenance solutions delivered by experienced professionals across Dubai.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="space-y-16">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Hammer;
              return (
                <div
                  key={service.id}
                  id={service.id}
                  data-testid={`service-detail-${index}`}
                  className="bg-white border border-border rounded-xl p-8 md:p-12 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3">
                      <div className="w-20 h-20 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                        <IconComponent className="w-10 h-10 text-accent" />
                      </div>
                      <h2 className="text-3xl font-bold text-primary mb-4">{service.name}</h2>
                      <p className="text-lg text-muted-foreground mb-6">{service.description}</p>
                      {contactInfo && (
                        <a
                          href={`tel:${contactInfo.phone}`}
                          data-testid={`service-contact-${index}`}
                          className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full font-medium hover:bg-accent/90 transition-all duration-300 hover:scale-105"
                        >
                          <Phone className="w-4 h-4" />
                          Contact Us
                        </a>
                      )}
                    </div>

                    <div className="md:w-2/3 space-y-6">
                      {/* Benefits */}
                      {service.benefits && service.benefits.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold text-primary mb-4">Service Benefits</h3>
                          <ul className="space-y-3">
                            {service.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-3" data-testid={`benefit-${index}-${idx}`}>
                                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                                <span className="text-foreground">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Problems Solved */}
                      {service.problems_solved && service.problems_solved.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold text-primary mb-4">Problems We Solve</h3>
                          <ul className="space-y-3">
                            {service.problems_solved.map((problem, idx) => (
                              <li key={idx} className="flex items-start gap-3" data-testid={`problem-${index}-${idx}`}>
                                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                                <span className="text-foreground">{problem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">
            Need a Custom Solution?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Don't see exactly what you're looking for? Contact us for customized technical and maintenance solutions tailored to your needs.
          </p>
          <Link
            to="/contact"
            data-testid="services-contact-cta"
            className="inline-flex bg-accent text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-accent/90 transition-all duration-300 hover:scale-105"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
};