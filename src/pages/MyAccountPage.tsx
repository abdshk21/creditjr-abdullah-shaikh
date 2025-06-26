
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
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with branding and back button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-[#102c54] hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/ce9c86db-4914-4c0d-8753-b431569de422.png" 
                alt="Tyche Online Academy" 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#102c54]">CreditJr</h1>
                <p className="text-sm text-gray-600">By Tyche Online Academy</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-[#102c54] hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <h2 className="text-2xl font-bold text-[#102c54]">My Account</h2>

        {/* Profile Card */}
        <Card className="shadow-lg border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
          <CardHeader className="bg-[#d8a434] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <User className="h-6 w-6" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Profile Picture Section */}
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                    <User className="h-8 w-8 text-gray-500" />
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
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                value={user?.email || ''}
                disabled
                className="w-full bg-gray-50"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              disabled={isUpdating}
              className="w-full bg-[#d8a434] hover:bg-[#d8a434]/90 text-white"
            >
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="shadow-lg border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
          <CardHeader>
            <CardTitle className="text-[#102c54]">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-red-600 border-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyAccountPage;
