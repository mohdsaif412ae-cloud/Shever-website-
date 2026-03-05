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
  ArrowRight,
  CheckCircle,
  Phone,
  MessageCircle
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

export const HomePage = () => {
  const [homeContent, setHomeContent] = useState(null);
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeRes, servicesRes, projectsRes, contactRes] = await Promise.all([
          axios.get(`${API}/home-content`),
          axios.get(`${API}/services`),
          axios.get(`${API}/projects`),
          axios.get(`${API}/contact-info`)
        ]);
        setHomeContent(homeRes.data);
        setServices(servicesRes.data.slice(0, 6));
        setProjects(projectsRes.data.slice(0, 4));
        setContactInfo(contactRes.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    <div data-testid="home-page">
      {/* Hero Section */}
      <section
        data-testid="hero-section"
        className="hero-section"
        style={{
          backgroundImage: `url(${homeContent?.hero_bg_image || ''})`,
        }}
      >
        <div className="hero-overlay"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up">
            {homeContent?.hero_title || 'Reliable Technical & Maintenance Services in Dubai'}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            {homeContent?.hero_subtitle || 'Professional HVAC, Electrical, Plumbing, and Building Maintenance Services delivered by experienced technicians.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {contactInfo && (
              <>
                <a
                  href={`tel:${contactInfo.phone}`}
                  data-testid="hero-call-button"
                  className="flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-accent/90 transition-all duration-300 hover:scale-105"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
                <a
                  href={`https://wa.me/${contactInfo.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="hero-whatsapp-button"
                  className="flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-green-600 transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <Link
                  to="/contact"
                  data-testid="hero-quote-button"
                  className="flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  Request Quote
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 md:py-32 bg-white" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive technical and maintenance solutions for residential and commercial properties in Dubai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Hammer;
              return (
                <div
                  key={service.id}
                  data-testid={`service-card-${index}`}
                  className="service-card bg-white border border-border/50 rounded-xl p-8 hover:shadow-lg group"
                >
                  <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                    <IconComponent className="w-7 h-7 text-accent group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-semibold text-primary mb-3">{service.name}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <Link
                    to={`/services#${service.id}`}
                    data-testid={`service-link-${index}`}
                    className="inline-flex items-center gap-2 text-accent font-medium hover:gap-3 transition-all"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              data-testid="view-all-services-button"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              View All Services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-32 bg-muted" data-testid="why-us-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
                Why Choose Shever Technical?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We are Dubai's trusted partner for all technical and maintenance services, delivering excellence with every project.
              </p>
              <ul className="space-y-4">
                {[
                  'Experienced and certified technicians',
                  'Quick response time - Available 24/7',
                  'Competitive pricing with transparent quotes',
                  'High-quality materials and workmanship',
                  'Customer satisfaction guaranteed',
                  'Annual Maintenance Contracts (AMC) available'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3" data-testid={`benefit-${index}`}>
                    <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                    <span className="text-lg text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1753964724380-2c5ae02512a8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHw0fHx0ZWNobmljaWFuJTIwaHZhYyUyMG1haW50ZW5hbmNlfGVufDB8fHx8MTc3Mjc1MDE5Nnww&ixlib=rb-4.1.0&q=85"
                alt="Professional technician"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="py-20 md:py-32 bg-white" data-testid="projects-section">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
                Featured Projects
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Take a look at some of our recent successful projects across Dubai.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  data-testid={`project-card-${index}`}
                  className="project-card aspect-[4/3] group"
                >
                  <img
                    src={`${BACKEND_URL}${project.image_path}`}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="project-overlay">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/projects"
                data-testid="view-all-projects-button"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              >
                View All Projects
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-accent text-white" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Contact us today for a free consultation and quote. Our team is ready to help with all your technical and maintenance needs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/contact"
              data-testid="cta-contact-button"
              className="bg-white text-accent px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
            >
              Contact Us Now
            </Link>
            {contactInfo && (
              <a
                href={`tel:${contactInfo.phone}`}
                data-testid="cta-call-button"
                className="bg-primary text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              >
                {contactInfo.phone}
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};