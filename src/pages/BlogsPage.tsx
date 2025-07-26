import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BlogsPage = () => {
  const navigate = useNavigate();

  const blogPosts = [
    {
      id: 1,
      title: "Essential Programming Skills for Financial Apps",
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      summary: "Learn the key programming concepts and technologies needed to build modern financial applications.",
      author: "Tech Expert",
      readTime: "5 min read",
      date: "Jan 15, 2024"
    },
    {
      id: 2,
      title: "Building Secure Web Applications",
      thumbnail: "https://images.unsplash.com/photo-1487058792275-0ad444038136",
      summary: "Discover best practices for creating secure web applications that protect user data and financial information.",
      author: "Security Specialist",
      readTime: "7 min read",
      date: "Jan 10, 2024"
    },
    {
      id: 3,
      title: "Modern Development Workflow for Finance Teams",
      thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      summary: "Streamline your development process with modern tools and practices tailored for financial technology.",
      author: "DevOps Engineer",
      readTime: "6 min read",
      date: "Jan 8, 2024"
    },
    {
      id: 4,
      title: "Clean Code Principles for Financial Software",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      summary: "Write maintainable and scalable code for financial applications with these proven principles.",
      author: "Senior Developer",
      readTime: "8 min read",
      date: "Jan 5, 2024"
    },
    {
      id: 5,
      title: "The Future of Financial Technology",
      thumbnail: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb",
      summary: "Explore emerging trends and technologies that are shaping the future of financial services.",
      author: "FinTech Analyst",
      readTime: "4 min read",
      date: "Jan 1, 2024"
    }
  ];

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

        {/* Blog Posts */}
        <div className="space-y-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300 cursor-pointer">
              <div className="relative">
                <img 
                  src={post.thumbnail} 
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs text-gray-600">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-[#102c54] line-clamp-2">
                  {post.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author}
                  </div>
                  <span>{post.date}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 leading-relaxed">
                  {post.summary}
                </p>
                <Button 
                  variant="ghost" 
                  className="mt-4 p-0 h-auto text-[#102c54] hover:text-[#102c54]/80 font-medium"
                >
                  Read More →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Note */}
        <Card className="shadow-lg border-0 bg-gray-50">
          <CardContent className="text-center p-6">
            <BookOpen className="h-8 w-8 mx-auto mb-3 text-[#102c54]" />
            <p className="text-gray-600">
              More insightful articles coming soon! Stay tuned for expert tips on finance, technology, and personal development.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogsPage;