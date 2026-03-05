import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API}/projects`);
        const projectsData = response.data;
        setProjects(projectsData);
        setFilteredProjects(projectsData);

        // Extract unique categories
        const uniqueCategories = [...new Set(projectsData.map(p => p.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, projects]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="projects-page" className="min-h-screen">
      {/* Header */}
      <section className="bg-primary text-white py-32 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Our Projects
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Explore our portfolio of successful projects across Dubai. Quality work delivered on time, every time.
          </p>
        </div>
      </section>

      {/* Filters */}
      {categories.length > 0 && (
        <section className="py-12 bg-muted">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-center gap-4 flex-wrap">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <button
                onClick={() => setSelectedCategory('all')}
                data-testid="filter-all"
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-accent text-white'
                    : 'bg-white text-foreground hover:bg-gray-100'
                }`}
              >
                All Projects
              </button>
              {categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`filter-${index}`}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-accent text-white'
                      : 'bg-white text-foreground hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No projects found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  data-testid={`project-card-${index}`}
                  className="project-card group"
                >
                  <div className="aspect-[4/3] relative overflow-hidden rounded-xl">
                    <img
                      src={`${BACKEND_URL}${project.image_path}`}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="project-overlay">
                      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                        {project.category}
                      </span>
                      <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                      <p className="text-sm text-gray-300">{project.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};