import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Mic, 
  Brain, 
  Upload, 
  HelpCircle, 
  Users, 
  Star,
  Play,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Heart,
  Award
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student, MIT",
      content: "AI Voice Tutor transformed my study sessions! The voice explanations help me understand complex algorithms so much better.",
      avatar: "👩‍💻"
    },
    {
      name: "Ahmed Hassan", 
      role: "Engineering Student, Stanford",
      content: "Upload my lecture notes and get personalized quizzes? This is the future of education. Absolutely brilliant!",
      avatar: "👨‍🎓"
    },
    {
      name: "Maria Rodriguez",
      role: "Data Science Student, Berkeley",
      content: "The AI actually understands my course material and explains it in my learning style. Game changer!",
      avatar: "👩‍🔬"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Voice Tutor
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition-colors">Reviews</a>
              <Link 
                to="/login" 
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Floating Elements */}
            <div className="absolute top-20 left-10 animate-float">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="absolute top-40 right-10 animate-float" style={{animationDelay: '1s'}}>
              <div className="bg-purple-100 p-3 rounded-full">
                <Mic className="h-6 w-6 text-purple-600" />
              </div>
            </div>

            {/* Main Hero Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full px-4 py-2 mb-8">
                <Brain className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">AI-Powered Learning Revolution</span>
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Study Smarter
                </span>
                <br />
                <span className="text-gray-900">with AI Voice</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Upload your study materials, ask questions, and get 
                <span className="font-semibold text-indigo-600"> personalized explanations</span> with 
                <span className="font-semibold text-purple-600"> professional voice responses</span> powered by advanced AI technology.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
                <button
                  onClick={() => navigate('/register')}
                  className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center space-x-2"
                >
                  <span>Start Learning Free</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="group flex items-center space-x-3 text-gray-700 hover:text-indigo-600 transition-colors">
                  <div className="bg-white p-3 rounded-full shadow-lg group-hover:shadow-xl transition-shadow">
                    <Play className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="font-medium">Watch Demo</span>
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-12 text-center">
                <div>
                  <div className="text-3xl font-bold text-indigo-600">10K+</div>
                  <div className="text-gray-600">Students Helped</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">500K+</div>
                  <div className="text-gray-600">Questions Answered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pink-600">99.9%</div>
                  <div className="text-gray-600">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Revolutionize Your Learning Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powered by Google Gemini AI and professional Murf voice synthesis, 
              our platform offers the most advanced educational technology available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Explanations",
                description: "Get personalized, intelligent answers to any question about your study materials.",
                color: "from-blue-500 to-indigo-600"
              },
              {
                icon: Mic,
                title: "Professional Voice Responses", 
                description: "Listen to high-quality voice explanations that make complex topics easy to understand.",
                color: "from-purple-500 to-pink-600"
              },
              {
                icon: Upload,
                title: "Smart File Processing",
                description: "Upload PDFs and let our AI analyze and understand your specific course content.",
                color: "from-green-500 to-teal-600"
              },
              {
                icon: HelpCircle,
                title: "Dynamic Quiz Generation",
                description: "Generate custom quizzes from your materials to test and reinforce your knowledge.",
                color: "from-orange-500 to-red-600"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Students Worldwide
            </h2>
            <div className="flex items-center justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-lg font-semibold text-gray-700">4.9/5 from 1,200+ reviews</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 md:p-12 rounded-2xl">
              <div className="text-center">
                <div className="text-6xl mb-6">{testimonials[currentTestimonial].avatar}</div>
                <blockquote className="text-xl md:text-2xl text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="font-semibold text-gray-900 mb-1">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-indigo-600">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </div>

            {/* Testimonial Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already studying smarter with AI Voice Tutor.
            Start your free account today!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2 text-indigo-100">
              <CheckCircle className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">AI Voice Tutor</span>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering students worldwide with intelligent AI tutoring
            </p>
            <div className="flex items-center justify-center space-x-6 mb-8">
              <Link to="/register" className="text-gray-400 hover:text-white transition-colors">Get Started</Link>
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Sign In</Link>
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a>
            </div>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-400 text-sm">
                © 2025 AI Voice Tutor. Transforming education through artificial intelligence. 
                Made with <Heart className="h-4 w-4 inline text-red-500" /> by Shubham Sinalkar
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
