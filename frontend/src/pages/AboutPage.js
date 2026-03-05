import { Users, Award, Shield, Wrench } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div data-testid="about-page" className="min-h-screen">
      {/* Header */}
      <section className="bg-primary text-white py-32 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            About Shever Technical
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Your trusted partner for professional technical and maintenance services in Dubai.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-white" data-testid="company-overview">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-6">Who We Are</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Shever Technical is a leading provider of comprehensive technical and maintenance services in Dubai. We specialize in HVAC, electrical, plumbing, and building maintenance solutions for both residential and commercial clients.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Located in the Commercial Bank of Dubai Building, Al Khabeesi, we are strategically positioned to serve clients across Dubai with rapid response times and exceptional service quality.
              </p>
              <p className="text-lg text-muted-foreground">
                Our commitment to excellence, combined with our team of experienced technicians, ensures that every project is completed to the highest standards of quality and professionalism.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1763581804286-683d28919444?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwzfHxkdWJhaSUyMHNreWxpbmUlMjBtb2Rlcm4lMjBidWlsZGluZ3xlbnwwfHx8fDE3NzI3NTAxOTd8MA&ixlib=rb-4.1.0&q=85"
                alt="Dubai skyline"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted" data-testid="core-values">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our core values drive everything we do, ensuring exceptional service delivery every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all" data-testid="value-expertise">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Technical Expertise</h3>
              <p className="text-muted-foreground">
                Certified technicians with years of experience in all aspects of technical maintenance and repair.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all" data-testid="value-team">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Experienced Team</h3>
              <p className="text-muted-foreground">
                A dedicated team of professionals committed to delivering excellence in every project.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all" data-testid="value-quality">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Quality & Safety</h3>
              <p className="text-muted-foreground">
                Adherence to the highest safety standards and quality assurance on all projects.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all" data-testid="value-commitment">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Customer Commitment</h3>
              <p className="text-muted-foreground">
                100% customer satisfaction guaranteed with transparent pricing and reliable service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-white" data-testid="service-areas">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Industries We Serve
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Providing specialized technical services across multiple sectors in Dubai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Residential',
                description: 'Homes, apartments, and residential complexes',
                image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400'
              },
              {
                title: 'Commercial',
                description: 'Offices, retail spaces, and commercial buildings',
                image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'
              },
              {
                title: 'Industrial',
                description: 'Warehouses, factories, and industrial facilities',
                image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400'
              }
            ].map((industry, index) => (
              <div key={index} className="relative overflow-hidden rounded-xl group" data-testid={`industry-${index}`}>
                <img
                  src={industry.image}
                  alt={industry.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{industry.title}</h3>
                  <p className="text-gray-200">{industry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};