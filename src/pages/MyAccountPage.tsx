
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const MyAccountPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [profilePicture, setProfilePicture] = useState(user?.user_metadata?.avatar_url || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          avatar_url: profilePicture
        }
      });
      
      if (error) {
        console.error('Error updating profile:', error);
      } else {
        // Show success feedback
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to Supabase storage
      // For now, we'll just create a local URL
      const url = URL.createObjectURL(file);
      setProfilePicture(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Enhanced Header with Gradient Background */}
        <div className="bg-gradient-to-r from-[#102c54] via-[#1e3a72] to-[#2d4f8a] rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10 w-12 h-12 rounded-full"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/ce9c86db-4914-4c0d-8753-b431569de422.png" 
                  alt="Tyche Online Academy" 
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
                <div>
                  <h1 className="text-3xl font-bold text-white">CreditJr</h1>
                  <p className="text-white/80">By Tyche Online Academy</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/10 w-12 h-12 rounded-full"
            >
              <LogOut className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-[#102c54]">My Account</h2>

        {/* Enhanced Profile Card */}
        <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
          <CardHeader className="bg-gradient-to-r from-[#d8a434] to-[#f4c430] text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-3">
              <User className="h-7 w-7" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Enhanced Profile Picture Section */}
            <div className="text-center space-y-4">
              <div className="relative w-32 h-32 mx-auto">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#d8a434] shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-[#d8a434] shadow-lg">
                    <User className="h-12 w-12 text-gray-500" />
                  </div>
                )}
              </div>
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="profile-upload"
                />
                <label htmlFor="profile-upload">
                  <Button variant="outline" className="cursor-pointer border-2 border-[#d8a434] text-[#d8a434] hover:bg-[#d8a434] hover:text-white" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Enhanced Display Name */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-gray-700">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full text-lg p-4 border-2 focus:border-[#d8a434]"
              />
            </div>

            {/* Enhanced Email (Read-only) */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-gray-700">Email</label>
              <Input
                value={user?.email || ''}
                disabled
                className="w-full text-lg p-4 bg-gray-50 border-2"
              />
            </div>

            {/* Enhanced Save Button */}
            <Button
              onClick={handleSaveProfile}
              disabled={isUpdating}
              className="w-full bg-gradient-to-r from-[#d8a434] to-[#f4c430] hover:from-[#e6b345] hover:to-[#f8d147] text-white py-4 text-lg font-semibold"
            >
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Account Actions */}
        <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
          <CardHeader>
            <CardTitle className="text-[#102c54] text-xl">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-red-600 border-2 border-red-600 hover:bg-red-50 py-4 text-lg font-semibold"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyAccountPage;
