import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, BookOpen, Clock, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Blog {
  id: string;
  title: string;
  summary: string;
  thumbnail_url: string;
  content: string;
  created_at: string;
}

const BlogsPage = () => {
  const navigate = useNavigate();

  // Fetch blog posts from Supabase
  const { data: blogPosts, isLoading, error } = useQuery<Blog[]>({
    queryKey: ['blogs'],
    queryFn: async () => {
      const response = await fetch('https://rwgnldyndqvcgdqvvanp.supabase.co/rest/v1/blogs?select=*&order=created_at.desc', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Z25sZHluZHF2Y2dkcXZ2YW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjAwMTIsImV4cCI6MjA2NjQzNjAxMn0.iEZgiJGE__GKM35jblWjXD7mgNQdI3TpZdhSwRLqIOI',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Z25sZHluZHF2Y2dkcXZ2YW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjAwMTIsImV4cCI6MjA2NjQzNjAxMn0.iEZgiJGE__GKM35jblWjXD7mgNQdI3TpZdhSwRLqIOI',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      
      const data = await response.json();
      return data as Blog[];
    },
  });

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-[#102c54] hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-[#102c54]">Blogs</h1>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#102c54]" />
            <span className="ml-2 text-gray-600">Loading blog posts...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="shadow-lg border-0 bg-red-50">
            <CardContent className="text-center p-8">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-xl font-semibold text-red-700 mb-2">
                Unable to load blog posts
              </div>
              <div className="text-red-600">
                Please try again later or contact support if the problem persists.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && blogPosts && blogPosts.length === 0 && (
          <Card className="shadow-lg border-0">
            <CardContent className="text-center p-8">
              <div className="text-6xl mb-6">📝</div>
              <div className="text-xl font-semibold text-gray-700 mb-4">
                No blog posts available yet
              </div>
              <div className="text-gray-600">
                Check back soon for insightful articles on finance, technology, and personal development!
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blog Posts */}
        {!isLoading && !error && blogPosts && blogPosts.length > 0 && (
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={post.thumbnail_url} 
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6';
                    }}
                  />
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-[#102c54] line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {post.summary}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="p-0 h-auto text-[#102c54] hover:text-[#102c54]/80 font-medium"
                      >
                        Read More →
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-[#102c54] pr-8">
                          {post.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <img 
                          src={post.thumbnail_url} 
                          alt={post.title}
                          className="w-full h-64 object-cover rounded-lg mb-6"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6';
                          }}
                        />
                        <div 
                          className="prose prose-lg max-w-none"
                          dangerouslySetInnerHTML={{ __html: post.content || post.summary }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default BlogsPage;