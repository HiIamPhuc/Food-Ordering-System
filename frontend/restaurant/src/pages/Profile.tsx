import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

const Profile = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    username: '',
    created_at: ''
  });
  const [stats, setStats] = useState({
    join_date: '',
    total_orders: 0,
    favorite_dish: '',
    total_spent: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/'); // Redirect to home if not authenticated
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileResponse = await fetch('http://localhost:8000/api/users/profile/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }
        const profileData = await profileResponse.json();

        const statsResponse = await fetch('http://localhost:8000/api/users/stats/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }
        const statsData = await statsResponse.json();

        setProfile({
          name: profileData.name || '',
          email: profileData.email || '',
          username: profileData.username || '',
          created_at: profileData.created_at || ''
        });
        setStats({
          join_date: statsData.join_date || '',
          total_orders: statsData.total_orders || 0,
          favorite_dish: statsData.favorite_dish || 'Unknown',
          total_spent: statsData.total_spent || 0,
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load profile.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, accessToken, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: profile.name,
          // Email and username are read-only in the backend
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setIsEditing(false);
      toast({
        title: 'Profile updated!',
        description: 'Your profile information has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values if needed (could fetch again or store initial state)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      Edit
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button
                        onClick={handleSave}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>                
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats & Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since:</span>
                    <span className="font-medium">{new Date(stats.join_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total orders:</span>
                    <span className="font-medium">{stats.total_orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Favorite dish:</span>
                    <span className="font-medium">{stats.favorite_dish}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total spent:</span>
                    <span className="font-medium text-orange-600">${stats.total_spent.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600" asChild>
                    {/* <a href="/menu">Order Now</a> */}
                    navigate('/menu')
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    {/* <a href="/orders">View Order History</a> */}
                    navigate('/orders')
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </Button>
                  {/* <Button variant="outline" className="w-full">
                    Download Receipts
                  </Button> */}
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader>
                  <CardTitle>Loyalty Program</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-orange-600">850</div>
                    <div className="text-sm text-gray-600">Loyalty Points</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="text-xs text-gray-500">150 points until free meal</div>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <AuthModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        initialMode="change-password"
      />
    </div>
  );
};

export default Profile;