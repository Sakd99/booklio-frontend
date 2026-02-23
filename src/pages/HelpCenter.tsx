import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, BookOpen, MessageSquare, Calendar, Zap, Shield, CreditCard,
  ChevronRight, ArrowLeft, Bot, Plug, Users, BarChart3, Globe, Bell,
  HelpCircle, ExternalLink,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
}

interface Category {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  articles: Article[];
}

const CATEGORIES: Category[] = [
  {
    id: 'getting-started',
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Getting Started',
    description: 'Learn the basics of setting up your Convly account',
    color: 'from-blue-500 to-blue-600',
    articles: [
      { id: 'gs-1', title: 'Creating your Convly account', excerpt: 'Step-by-step guide to creating and setting up your new Convly account.', category: 'getting-started' },
      { id: 'gs-2', title: 'Completing the onboarding process', excerpt: 'How to set up your business profile, industry, and AI instructions during onboarding.', category: 'getting-started' },
      { id: 'gs-3', title: 'Understanding your dashboard', excerpt: 'A tour of the Convly dashboard and all its features.', category: 'getting-started' },
      { id: 'gs-4', title: 'Setting up your first service', excerpt: 'How to create services with pricing, duration, and availability.', category: 'getting-started' },
    ],
  },
  {
    id: 'channels',
    icon: <Plug className="w-6 h-6" />,
    title: 'Channels & Integrations',
    description: 'Connect Instagram, WhatsApp, TikTok, Telegram & Messenger',
    color: 'from-violet-500 to-violet-600',
    articles: [
      { id: 'ch-1', title: 'Connecting your Instagram account', excerpt: 'How to connect your Instagram Business account to receive and respond to DMs automatically.', category: 'channels' },
      { id: 'ch-2', title: 'Setting up WhatsApp Business', excerpt: 'Guide to connecting WhatsApp Business API through the embedded signup flow.', category: 'channels' },
      { id: 'ch-3', title: 'Connecting TikTok', excerpt: 'How to connect your TikTok account for DM automation.', category: 'channels' },
      { id: 'ch-4', title: 'Setting up Telegram bot', excerpt: 'Create and connect a Telegram bot to handle customer conversations.', category: 'channels' },
      { id: 'ch-5', title: 'Connecting Facebook Messenger', excerpt: 'How to connect your Facebook Page to receive Messenger conversations.', category: 'channels' },
    ],
  },
  {
    id: 'ai-assistant',
    icon: <Bot className="w-6 h-6" />,
    title: 'AI Assistant',
    description: 'Configure your AI to answer questions and detect booking intent',
    color: 'from-emerald-500 to-emerald-600',
    articles: [
      { id: 'ai-1', title: 'How the AI assistant works', excerpt: 'Understanding how Convly AI detects intent, answers questions, and guides customers to book.', category: 'ai-assistant' },
      { id: 'ai-2', title: 'Customizing AI instructions', excerpt: 'How to write effective AI instructions for your specific business.', category: 'ai-assistant' },
      { id: 'ai-3', title: 'AI language detection', excerpt: 'How the AI automatically detects and responds in the customer\'s language.', category: 'ai-assistant' },
      { id: 'ai-4', title: 'Training your AI with documents', excerpt: 'Upload business documents to help the AI answer questions more accurately.', category: 'ai-assistant' },
    ],
  },
  {
    id: 'bookings',
    icon: <Calendar className="w-6 h-6" />,
    title: 'Bookings & Appointments',
    description: 'Manage bookings, services, and availability',
    color: 'from-orange-500 to-orange-600',
    articles: [
      { id: 'bk-1', title: 'Managing your bookings', excerpt: 'How to view, create, and manage customer appointments from the dashboard.', category: 'bookings' },
      { id: 'bk-2', title: 'Setting up services & availability', excerpt: 'Configure your services with pricing, duration, and available time slots.', category: 'bookings' },
      { id: 'bk-3', title: 'Exporting bookings to CSV', excerpt: 'How to export your booking data for reporting and analysis.', category: 'bookings' },
      { id: 'bk-4', title: 'Booking status workflow', excerpt: 'Understanding booking statuses: Pending, Confirmed, Completed, Cancelled, No-show.', category: 'bookings' },
    ],
  },
  {
    id: 'conversations',
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Conversations & Inbox',
    description: 'Manage all customer conversations in one place',
    color: 'from-pink-500 to-pink-600',
    articles: [
      { id: 'cv-1', title: 'Using the unified inbox', excerpt: 'How to manage conversations from all channels in one unified inbox.', category: 'conversations' },
      { id: 'cv-2', title: 'Replying to customers manually', excerpt: 'How to take over from the AI and send manual replies.', category: 'conversations' },
      { id: 'cv-3', title: 'Toggling AI on/off per conversation', excerpt: 'How to enable or disable AI responses for specific conversations.', category: 'conversations' },
    ],
  },
  {
    id: 'automations',
    icon: <Zap className="w-6 h-6" />,
    title: 'Automations',
    description: 'Create automated workflows for your business',
    color: 'from-amber-500 to-amber-600',
    articles: [
      { id: 'au-1', title: 'Creating your first automation', excerpt: 'Step-by-step guide to building automation workflows with the visual flow builder.', category: 'automations' },
      { id: 'au-2', title: 'Automation triggers', excerpt: 'Understanding different triggers: new conversation, keyword, booking created, etc.', category: 'automations' },
      { id: 'au-3', title: 'Using the flow builder', excerpt: 'How to use the drag-and-drop flow builder to create complex automations.', category: 'automations' },
    ],
  },
  {
    id: 'team',
    icon: <Users className="w-6 h-6" />,
    title: 'Team Management',
    description: 'Invite team members and manage permissions',
    color: 'from-cyan-500 to-cyan-600',
    articles: [
      { id: 'tm-1', title: 'Inviting team members', excerpt: 'How to invite team members and assign roles.', category: 'team' },
      { id: 'tm-2', title: 'Managing permissions', excerpt: 'Configure granular permissions for each team member.', category: 'team' },
    ],
  },
  {
    id: 'billing',
    icon: <CreditCard className="w-6 h-6" />,
    title: 'Billing & Plans',
    description: 'Understand plans, usage limits, and billing',
    color: 'from-indigo-500 to-indigo-600',
    articles: [
      { id: 'bl-1', title: 'Understanding plans & pricing', excerpt: 'Compare Free, Starter, Business, and Pro plans and their features.', category: 'billing' },
      { id: 'bl-2', title: 'Usage limits explained', excerpt: 'How message, AI call, booking, and channel limits work.', category: 'billing' },
      { id: 'bl-3', title: 'Upgrading your plan', excerpt: 'How to upgrade or change your subscription plan.', category: 'billing' },
    ],
  },
];

const POPULAR_ARTICLES = [
  'Creating your Convly account',
  'Connecting your Instagram account',
  'How the AI assistant works',
  'Managing your bookings',
  'Using the unified inbox',
  'Understanding plans & pricing',
];

export default function HelpCenter() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const allArticles = CATEGORIES.flatMap((c) => c.articles);
  const filteredArticles = search.trim()
    ? allArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.excerpt.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-b-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-bold text-foreground">Convly</span>
            <span className="text-sm text-muted ml-1">Help Center</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero / Search */}
      <div className="bg-gradient-to-br from-blue-500/5 via-violet-500/5 to-transparent border-b border-b-border">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-foreground mb-3"
          >
            How can we help you?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted mb-8"
          >
            Search our knowledge base or browse categories below
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dim" />
            <input
              type="text"
              placeholder="Search for articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-b-border text-foreground placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-sm shadow-lg"
            />
          </motion.div>

          {/* Search Results */}
          {search.trim() && (
            <div className="mt-4 max-w-xl mx-auto text-left">
              <div className="bg-card border border-b-border rounded-xl shadow-lg overflow-hidden">
                {filteredArticles.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted text-sm">
                    No articles found for "{search}"
                  </div>
                ) : (
                  filteredArticles.slice(0, 8).map((article) => (
                    <button
                      key={article.id}
                      onClick={() => {
                        setSelectedArticle(article);
                        setSearch('');
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface transition-colors text-left border-b border-b-border last:border-0"
                    >
                      <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{article.title}</div>
                        <div className="text-xs text-muted truncate">{article.excerpt}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-dim flex-shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {selectedArticle ? (
          /* Article View */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl mx-auto"
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="bg-card border border-b-border rounded-2xl p-8">
              <div className="flex items-center gap-2 text-xs text-blue-500 font-medium mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                {CATEGORIES.find((c) => c.id === selectedArticle.category)?.title}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">{selectedArticle.title}</h1>
              <p className="text-muted leading-relaxed mb-6">{selectedArticle.excerpt}</p>
              <div className="prose prose-sm max-w-none text-muted">
                <p>
                  This article provides detailed instructions on how to use this feature in Convly.
                  Follow the steps below to get started.
                </p>
                <h3 className="text-foreground font-semibold mt-6 mb-3">Step 1: Navigate to the feature</h3>
                <p>
                  Log in to your Convly dashboard and navigate to the relevant section from the sidebar menu.
                </p>
                <h3 className="text-foreground font-semibold mt-6 mb-3">Step 2: Configure your settings</h3>
                <p>
                  Follow the on-screen instructions to configure the feature according to your business needs.
                  Make sure to save your changes before leaving the page.
                </p>
                <h3 className="text-foreground font-semibold mt-6 mb-3">Need more help?</h3>
                <p>
                  If you need additional assistance, please contact our support team or visit the
                  Convly community forum.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-b-border">
                <p className="text-sm text-muted mb-3">Was this article helpful?</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm rounded-lg border border-b-border hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 transition-colors">
                    👍 Yes
                  </button>
                  <button className="px-4 py-2 text-sm rounded-lg border border-b-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-colors">
                    👎 No
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : selectedCategory ? (
          /* Category View */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl mx-auto"
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              All Categories
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedCategory.color} flex items-center justify-center text-white`}>
                {selectedCategory.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedCategory.title}</h2>
                <p className="text-sm text-muted">{selectedCategory.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              {selectedCategory.articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="w-full bg-card border border-b-border rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/30 hover:shadow-md transition-all text-left group"
                >
                  <BookOpen className="w-5 h-5 text-muted group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{article.title}</div>
                    <div className="text-xs text-muted mt-0.5 truncate">{article.excerpt}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-dim group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Categories Grid */
          <>
            <h2 className="text-xl font-bold text-foreground mb-6">Browse by Category</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedCategory(cat)}
                  className="bg-card border border-b-border rounded-2xl p-5 text-left hover:border-blue-500/30 hover:shadow-lg transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{cat.title}</h3>
                  <p className="text-xs text-muted line-clamp-2">{cat.description}</p>
                  <div className="text-[10px] text-dim mt-2">{cat.articles.length} articles</div>
                </motion.button>
              ))}
            </div>

            {/* Popular Articles */}
            <h2 className="text-xl font-bold text-foreground mb-6">Popular Articles</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {POPULAR_ARTICLES.map((title) => {
                const article = allArticles.find((a) => a.title === title);
                if (!article) return null;
                return (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="bg-card border border-b-border rounded-xl p-4 flex items-center gap-3 hover:border-blue-500/30 hover:shadow-md transition-all text-left group"
                  >
                    <BookOpen className="w-4 h-4 text-muted group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{article.title}</div>
                      <div className="text-xs text-muted truncate">{article.excerpt}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-dim flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Contact Support */}
            <div className="mt-12 bg-gradient-to-br from-blue-500/5 to-violet-500/5 border border-b-border rounded-2xl p-8 text-center">
              <HelpCircle className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-2">Still need help?</h3>
              <p className="text-sm text-muted mb-4 max-w-md mx-auto">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <a
                href="mailto:support@convly.dev"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                Contact Support
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-b-border py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">C</span>
            </div>
            <span className="text-sm text-muted">© 2026 Convly. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
