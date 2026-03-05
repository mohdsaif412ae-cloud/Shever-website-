import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Wrench, FolderKanban, MessageSquare, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
});

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    services: 0,
    projects: 0,
    contact_submissions: 0,
    gallery_images: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/admin/stats`, getAuthHeader());
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Services', value: stats.services, icon: Wrench, color: 'bg-blue-500' },
    { title: 'Projects', value: stats.projects, icon: FolderKanban, color: 'bg-green-500' },
    { title: 'Contact Submissions', value: stats.contact_submissions, icon: MessageSquare, color: 'bg-purple-500' },
    { title: 'Gallery Images', value: stats.gallery_images, icon: ImageIcon, color: 'bg-orange-500' },
  ];

  return (
    <AdminLayout>
      <div data-testid="admin-dashboard-page">
        <h1 className="text-4xl font-bold text-primary mb-8">Dashboard Overview</h1>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  data-testid={`stat-card-${index}`}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-primary mb-1">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-primary mb-4">Welcome to Shever Technical CMS</h2>
          <p className="text-muted-foreground mb-4">
            Manage your website content from this dashboard. You can update services, add projects, manage contact information, and more.
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• <strong>Services:</strong> Add, edit, or remove technical services</li>
            <li>• <strong>Projects:</strong> Upload project images and details</li>
            <li>• <strong>Home Content:</strong> Update hero section text and images</li>
            <li>• <strong>Contact Info:</strong> Manage company contact details</li>
            <li>• <strong>Gallery:</strong> Upload and manage gallery images</li>
            <li>• <strong>Site Settings:</strong> Update company logo</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};
