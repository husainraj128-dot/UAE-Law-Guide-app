import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, 
  Briefcase, 
  Car, 
  UserCheck, 
  ShieldAlert, 
  Building2, 
  Home, 
  Search, 
  MessageSquare, 
  ChevronRight, 
  Info,
  BookOpen,
  X,
  Send,
  Loader2,
  Bookmark,
  History,
  ArrowLeft,
  ExternalLink,
  Gavel,
  MapPin,
  Clock,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LawCategory, ChatMessage } from './types';
import { askLegalAssistant, getLawSummary } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = [
  { id: LawCategory.LABOR, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', description: 'Employment contracts, gratuity, and worker rights.' },
  { id: LawCategory.BUSINESS, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', description: 'Company setup, licensing, and commercial laws.' },
  { id: LawCategory.TAXATION, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', description: 'VAT filing, Corporate Tax, and FTA compliance.' },
  { id: LawCategory.TRAFFIC, icon: Car, color: 'text-orange-600', bg: 'bg-orange-50', description: 'Road safety, fines, and licensing regulations.' },
  { id: LawCategory.RESIDENCY, icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50', description: 'Visas, Emirates ID, and residency permits.' },
  { id: LawCategory.REAL_ESTATE, icon: Home, color: 'text-amber-600', bg: 'bg-amber-50', description: 'Tenancy, property ownership, and RERA rules.' },
  { id: LawCategory.CRIMINAL, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', description: 'Penal codes, legal proceedings, and safety.' },
  { id: LawCategory.CIVIL, icon: Scale, color: 'text-indigo-600', bg: 'bg-indigo-50', description: 'Personal status, contracts, and civil rights.' },
  { id: LawCategory.PROFESSIONAL, icon: BookOpen, color: 'text-slate-600', bg: 'bg-slate-50', description: 'Industry-specific codes and certifications.' },
];

export default function App() {
  const [view, setView] = useState<'home' | 'detail'>('home');
  const [selectedCategory, setSelectedCategory] = useState<LawCategory | null>(null);
  const [categoryContent, setCategoryContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [activeEmirate, setActiveEmirate] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [toc, setToc] = useState<{ id: string; text: string }[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categoryContent) {
      const headings = categoryContent.match(/^##\s+(.+)$/gm);
      if (headings) {
        setToc(headings.map(h => {
          const text = h.replace(/^##\s+/, '');
          return { id: text.toLowerCase().replace(/[^\w]+/g, '-'), text };
        }));
      } else {
        setToc([]);
      }
    }
  }, [categoryContent]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  const handleCategoryClick = async (category: LawCategory) => {
    setSelectedCategory(category);
    setView('detail');
    setIsLoadingContent(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const content = await getLawSummary(category);
      setCategoryContent(content || 'No information available.');
    } catch (error) {
      console.error('Error fetching law summary:', error);
      setCategoryContent('Failed to load information. Please try again.');
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleBack = () => {
    setView('home');
    setSelectedCategory(null);
    setCategoryContent(null);
    setToc([]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim() || isTyping) return;

    const newUserMessage: ChatMessage = { role: 'user', text: userInput };
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await askLegalAssistant(userInput, chatMessages);
      setChatMessages(prev => [...prev, { role: 'model', text: response || 'I apologize, I could not process that request.' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackStatus('submitting');
    setTimeout(() => {
      setFeedbackStatus('success');
      setTimeout(() => setFeedbackStatus('idle'), 3000);
    }, 1500);
  };

  const EMIRATES_DIRECTORY = [
    {
      emirate: "Abu Dhabi",
      departments: [
        { name: "Abu Dhabi Police", timing: "24/7", link: "https://www.adpolice.gov.ae", map: "https://goo.gl/maps/AbuDhabiPoliceHQ" },
        { name: "DMT (Municipality)", timing: "07:30 - 15:30 (Mon-Fri)", link: "https://www.dmt.gov.ae", map: "https://goo.gl/maps/AbuDhabiMunicipality" },
        { name: "Economic Development", timing: "07:30 - 15:30 (Mon-Fri)", link: "https://added.gov.ae", map: "https://goo.gl/maps/AbuDhabiADDED" },
        { name: "Judicial Department", timing: "07:30 - 15:30 (Mon-Fri)", link: "https://www.adjd.gov.ae", map: "https://goo.gl/maps/AbuDhabiJudicial" }
      ]
    },
    {
      emirate: "Dubai",
      departments: [
        { name: "Dubai Police", timing: "24/7", link: "https://www.dubaipolice.gov.ae", map: "https://goo.gl/maps/DubaiPoliceHQ" },
        { name: "Dubai Municipality", timing: "07:30 - 15:30 (Mon-Fri)", link: "https://www.dm.gov.ae", map: "https://goo.gl/maps/DubaiMunicipality" },
        { name: "RTA", timing: "07:30 - 19:00 (Mon-Sat)", link: "https://www.rta.ae", map: "https://goo.gl/maps/DubaiRTA" },
        { name: "Dubai Courts", timing: "08:00 - 15:00 (Mon-Fri)", link: "https://www.dc.gov.ae", map: "https://goo.gl/maps/DubaiCourts" }
      ]
    },
    {
      emirate: "Sharjah",
      departments: [
        { name: "Sharjah Police", timing: "24/7", link: "https://www.shjpolice.gov.ae", map: "https://goo.gl/maps/SharjahPoliceHQ" },
        { name: "Sharjah Municipality", timing: "07:30 - 14:30 (Mon-Thu)", link: "https://portal.shjmun.gov.ae", map: "https://goo.gl/maps/SharjahMunicipality" },
        { name: "Economic Development", timing: "07:30 - 14:30 (Mon-Thu)", link: "https://sedd.ae", map: "https://goo.gl/maps/SharjahSEDD" }
      ]
    },
    {
      emirate: "Northern Emirates",
      departments: [
        { name: "Ajman Municipality", timing: "07:30 - 14:30", link: "https://www.am.gov.ae", map: "https://goo.gl/maps/AjmanMunicipality" },
        { name: "RAK Municipality", timing: "07:30 - 14:30", link: "https://www.rak.ae", map: "https://goo.gl/maps/RAKMunicipality" },
        { name: "Fujairah Municipality", timing: "07:30 - 14:30", link: "https://www.fujmun.gov.ae", map: "https://goo.gl/maps/FujairahMunicipality" },
        { name: "UAQ Municipality", timing: "07:30 - 14:30", link: "https://www.uaq.ae", map: "https://goo.gl/maps/UAQMunicipality" }
      ]
    }
  ];

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD] selection:bg-uae-gold selection:text-white">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-100 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-[11px] md:text-xs text-amber-800 font-medium">
            <span className="font-bold">Disclaimer:</span> This is an AI-powered information portal and <span className="underline">not</span> an official government website. Information may be outdated or incorrect. Always verify with official sources.
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={handleBack}
          >
            <div className="w-11 h-11 bg-uae-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
              <Gavel className="text-uae-gold w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">UAE Law Guide</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Federal Legal Portal</p>
            </div>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-xl mx-12">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-uae-gold transition-colors" />
              <input 
                type="text"
                placeholder="Search regulations, laws, or ask AI..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-uae-gold/10 focus:border-uae-gold rounded-2xl text-sm transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setIsChatOpen(true);
                    setUserInput(searchQuery);
                    setSearchQuery('');
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="relative flex items-center gap-2 px-6 py-3 bg-uae-black text-white rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-uae-gold" />
              <span className="hidden sm:inline">Legal Assistant</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            >
              {/* Hero Section */}
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6"
                >
                  Everything UAE Law. <br />
                  <span className="text-uae-gold">Simplified for You.</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
                >
                  Access comprehensive guidelines, filing procedures, and required documents for all UAE regulations under one roof.
                </motion.p>
              </div>

              {/* Stats/Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {[
                  { label: 'Active Regulations', value: '500+', icon: Scale },
                  { label: 'AI Legal Assistant', value: '24/7', icon: MessageSquare },
                  { label: 'Official Sources', value: '100%', icon: ShieldAlert },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-uae-gold" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                {filteredCategories.map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-uae-gold/10 hover:-translate-y-2 transition-all text-left overflow-hidden"
                  >
                    <div className={cn("inline-flex p-4 rounded-2xl mb-6 transition-transform group-hover:scale-110", cat.bg)}>
                      <cat.icon className={cn("w-7 h-7", cat.color)} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-uae-gold transition-colors">{cat.id}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      {cat.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold text-uae-gold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                      Explore Guide <ChevronRight className="w-4 h-4" />
                    </div>
                    
                    {/* Decorative background element */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform" />
                  </motion.button>
                ))}
              </div>

              {/* Official Portals Section */}
              <motion.section 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative"
              >
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                    <div>
                      <h3 className="text-3xl font-bold mb-4">Official Government Portals</h3>
                      <p className="text-slate-400 max-w-xl">
                        For the most accurate and latest updates, always refer to the official UAE government websites. These are the primary sources for all legal and regulatory guidelines.
                      </p>
                    </div>
                    <a 
                      href="https://u.ae" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-uae-gold text-uae-black font-bold rounded-2xl hover:bg-white transition-colors flex items-center gap-2"
                    >
                      Visit u.ae <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { name: 'MOHRE', desc: 'Labor & Employment', url: 'https://www.mohre.gov.ae' },
                      { name: 'FTA', desc: 'VAT & Corporate Tax', url: 'https://tax.gov.ae' },
                      { name: 'Ministry of Justice', desc: 'Federal Laws & Courts', url: 'https://www.moj.gov.ae' },
                      { name: 'RTA Dubai', desc: 'Traffic & Transport', url: 'https://www.rta.ae' },
                      { name: 'ICP', desc: 'Visa & Residency', url: 'https://icp.gov.ae' },
                      { name: 'Ministry of Economy', desc: 'Business & Trade', url: 'https://www.economy.gov.ae' },
                      { name: 'Dubai Land Dept', desc: 'Real Estate & RERA', url: 'https://dubailand.gov.ae' },
                      { name: 'Abu Dhabi Police', desc: 'Safety & Regulations', url: 'https://www.adpolice.gov.ae' },
                    ].map((portal, i) => (
                      <a 
                        key={i}
                        href={portal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-uae-gold transition-all group"
                      >
                        <h4 className="font-bold text-uae-gold mb-1 group-hover:translate-x-1 transition-transform">{portal.name}</h4>
                        <p className="text-xs text-slate-400">{portal.desc}</p>
                      </a>
                    ))}
                  </div>
                </div>
                <Scale className="absolute -right-20 -bottom-20 w-96 h-96 text-white/5 -rotate-12" />
              </motion.section>

              {/* Emirates Directory Section */}
              <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-20"
              >
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-uae-gold/10 text-uae-gold rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                      <MapPin className="w-3 h-3" /> Local Directory
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">Emirates & Departments</h3>
                    <p className="text-slate-500 mt-2">Operational timings and official links for key government entities across the UAE.</p>
                  </div>
                  
                  <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    {EMIRATES_DIRECTORY.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveEmirate(idx)}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                          activeEmirate === idx 
                            ? "bg-white text-uae-black shadow-sm" 
                            : "text-slate-500 hover:text-slate-900"
                        )}
                      >
                        {item.emirate}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnimatePresence mode="wait">
                    {EMIRATES_DIRECTORY[activeEmirate].departments.map((dept, i) => (
                      <motion.div
                        key={`${activeEmirate}-${i}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-uae-gold/20 transition-all group"
                      >
                        <h4 className="font-bold text-slate-900 mb-4 group-hover:text-uae-gold transition-colors">{dept.name}</h4>
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                            <span>{dept.timing}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <Globe className="w-3.5 h-3.5 text-slate-300" />
                            <span className="truncate">{dept.link.replace('https://', '')}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-300" />
                            <a href={dept.map} target="_blank" rel="noopener noreferrer" className="text-uae-gold hover:underline font-bold">View on Google Maps</a>
                          </div>
                        </div>
                        <a 
                          href={dept.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-3 bg-slate-50 text-slate-900 text-xs font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-uae-gold group-hover:text-uae-black transition-all"
                        >
                          Visit Website <ExternalLink className="w-3 h-3" />
                        </a>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>

              {/* Service Inquiry Section */}
              <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-20 bg-uae-gold/5 rounded-[3rem] p-12 border border-uae-gold/10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-6">Get Legal Guidance & Assistance</h3>
                    <p className="text-slate-600 text-lg leading-relaxed mb-8">
                      Need help with a specific legal matter? Submit your inquiry below, and our portal will provide you with the necessary guidance and official procedures.
                    </p>
                    
                    <div className="space-y-6">
                      {[
                        { icon: CheckCircle2, title: "Service Guidance", text: "Get step-by-step help for your specific legal needs and filing procedures." },
                        { icon: MessageSquare, title: "Legal Inquiries", text: "Submit questions regarding labor, visa, business, or property laws." },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                            <item.icon className="w-6 h-6 text-uae-gold" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                            <p className="text-sm text-slate-500">{item.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-uae-gold/5 border border-slate-100">
                    {feedbackStatus === 'success' ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-12 text-center"
                      >
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 mb-2">Inquiry Received</h4>
                        <p className="text-slate-500">Your service inquiry has been logged. Our AI assistant will also help you if you use the chat below.</p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</label>
                            <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-uae-gold outline-none transition-all" placeholder="John Doe" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                            <input required type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-uae-gold outline-none transition-all" placeholder="john@example.com" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Category</label>
                          <select required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-uae-gold outline-none transition-all appearance-none cursor-pointer">
                            <option value="">Select a category</option>
                            <option>Labor & Employment</option>
                            <option>Visa & Residency</option>
                            <option>Business & Corporate Law</option>
                            <option>Real Estate & Property</option>
                            <option>Traffic & Transport</option>
                            <option>Family & Personal Status</option>
                            <option>Other Legal Services</option>
                            <option>Others</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inquiry Details</label>
                          <textarea required rows={4} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-uae-gold outline-none transition-all resize-none" placeholder="Describe the service or legal matter you need help with..."></textarea>
                        </div>
                        <button 
                          type="submit" 
                          disabled={feedbackStatus === 'submitting'}
                          className="w-full py-4 bg-uae-black text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {feedbackStatus === 'submitting' ? (
                            <> <Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                          ) : (
                            <> <Send className="w-4 h-4 text-uae-gold" /> Submit Inquiry</>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </motion.section>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-screen pb-20"
            >
              {/* Detail Header */}
              <div className="bg-white border-b border-slate-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-uae-gold transition-colors mb-8 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                  </button>
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className={cn("p-6 rounded-3xl shadow-xl shadow-black/5", CATEGORIES.find(c => c.id === selectedCategory)?.bg)}>
                        {React.createElement(CATEGORIES.find(c => c.id === selectedCategory)?.icon || Scale, {
                          className: cn("w-10 h-10", CATEGORIES.find(c => c.id === selectedCategory)?.color)
                        })}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-uae-gold/10 text-uae-gold text-[10px] font-bold uppercase tracking-widest rounded-full">Official Guide</span>
                          <span className="text-xs text-slate-400 font-medium">Last updated: Feb 2024</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{selectedCategory}</h2>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleBookmark(selectedCategory!)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all",
                          bookmarks.includes(selectedCategory!) 
                            ? "bg-uae-gold text-white shadow-lg shadow-uae-gold/20" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        <Bookmark className={cn("w-4 h-4", bookmarks.includes(selectedCategory!) && "fill-current")} />
                        {bookmarks.includes(selectedCategory!) ? 'Saved' : 'Save Guide'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  {/* TOC Sidebar */}
                  <div className="lg:col-span-3">
                    <div className="sticky top-32 space-y-8">
                      {toc.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">On this page</h4>
                          <nav className="space-y-1">
                            {toc.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  const el = document.getElementById(item.id);
                                  if (el) {
                                    const offset = 100;
                                    const bodyRect = document.body.getBoundingClientRect().top;
                                    const elementRect = el.getBoundingClientRect().top;
                                    const elementPosition = elementRect - bodyRect;
                                    const offsetPosition = elementPosition - offset;
                                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                                  }
                                }}
                                className="block w-full text-left text-sm font-medium text-slate-500 hover:text-uae-gold hover:bg-uae-gold/5 transition-all py-2.5 px-4 rounded-xl border-l-2 border-transparent hover:border-uae-gold"
                              >
                                {item.text}
                              </button>
                            ))}
                          </nav>
                        </div>
                      )}

                      <div className="bg-uae-black rounded-[2rem] p-8 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                          <h4 className="text-xl font-bold mb-4">Need specific help?</h4>
                          <p className="text-slate-400 text-sm leading-relaxed mb-6">Our AI Legal Assistant can help you with specific cases and document requirements.</p>
                          <button 
                            onClick={() => setIsChatOpen(true)}
                            className="w-full py-3 bg-uae-gold text-uae-black font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
                          >
                            Ask Assistant <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                        <Scale className="absolute -right-8 -bottom-8 w-32 h-32 text-white/5 rotate-12 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Main Reading Area */}
                  <div className="lg:col-span-9">
                    {isLoadingContent ? (
                      <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="relative">
                          <Loader2 className="w-12 h-12 text-uae-gold animate-spin" />
                          <Scale className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-uae-gold/40" />
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-slate-900 mb-1">Consulting UAE Legal Database</p>
                          <p className="text-slate-400 text-sm">Generating comprehensive guide with subsections...</p>
                        </div>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-16"
                      >
                        <div className="markdown-body prose prose-slate max-w-none">
                          <Markdown
                            components={{
                              h2: ({ children }) => {
                                const text = String(children);
                                const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                                return <h2 id={id} className="scroll-mt-32">{children}</h2>;
                              },
                              a: ({ href, children }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-uae-gold hover:underline font-bold">
                                  {children} <ExternalLink className="w-3 h-3" />
                                </a>
                              )
                            }}
                          >
                            {categoryContent}
                          </Markdown>
                        </div>
                        
                        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                              <Info className="w-6 h-6 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">Found this helpful?</p>
                              <p className="text-xs text-slate-400">Share this guide with others.</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-6 py-2 bg-slate-50 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors">Share</button>
                            <button className="px-6 py-2 bg-slate-50 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors">Print PDF</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-uae-black text-uae-gold rounded-full shadow-2xl flex items-center justify-center border-2 border-uae-gold/20 group"
      >
        <MessageSquare className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-uae-gold text-uae-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-uae-black animate-bounce">
          AI
        </div>
      </motion.button>

      {/* AI Chat Drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-uae-black text-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-uae-gold rounded-xl flex items-center justify-center shadow-lg shadow-uae-gold/20">
                    <MessageSquare className="w-6 h-6 text-uae-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Legal AI Assistant</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-[10px] text-uae-gold uppercase tracking-[0.2em] font-black">Online & Ready</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12 px-6">
                    <div className="w-24 h-24 bg-uae-gold/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 relative">
                      <Scale className="w-12 h-12 text-uae-gold" />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-uae-black rounded-xl flex items-center justify-center border-4 border-white">
                        <MessageSquare className="w-4 h-4 text-uae-gold" />
                      </div>
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Your Legal AI Partner</h4>
                    <p className="text-slate-500 mb-10 leading-relaxed text-sm">
                      I can summarize legal processes, find accurate information from the UAE Federal Database, and direct you to official government portals for the latest updates.
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        "Summarize the Golden Visa process",
                        "How to start a business in Dubai?",
                        "What are the labor law termination rules?",
                        "Official link for FTA VAT registration"
                      ].map((q) => (
                        <button 
                          key={q}
                          onClick={() => {
                            setUserInput(q);
                          }}
                          className="w-full p-4 text-left text-sm font-bold bg-white border border-slate-100 rounded-2xl hover:border-uae-gold hover:shadow-xl hover:shadow-uae-gold/5 transition-all text-slate-700 flex items-center justify-between group"
                        >
                          {q}
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-uae-gold group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex w-full",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[90%] p-5 rounded-[2rem] text-sm shadow-sm",
                      msg.role === 'user' 
                        ? "bg-uae-black text-white rounded-tr-none shadow-xl shadow-black/10" 
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                    )}>
                      <div className="markdown-body text-inherit prose-sm">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-5 rounded-[2rem] rounded-tl-none shadow-sm flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-uae-gold rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-uae-gold rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-uae-gold rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Assistant is drafting...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-6 border-t border-slate-100 bg-white">
                <form 
                  onSubmit={handleSendMessage}
                  className="relative flex items-center"
                >
                  <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask about laws, documents, or fines..."
                    className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-uae-gold/10 focus:border-uae-gold rounded-2xl text-sm font-medium transition-all outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={!userInput.trim() || isTyping}
                    className="absolute right-2 p-3 bg-uae-black text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                  >
                    <Send className="w-4 h-4 text-uae-gold" />
                  </button>
                </form>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <ShieldAlert className="w-3 h-3 text-slate-300" />
                  <p className="text-[10px] text-slate-400 font-medium text-center">
                    AI responses are for guidance only. Always verify with official UAE portals.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-uae-gold rounded-xl flex items-center justify-center">
                  <Gavel className="text-uae-black w-5 h-5" />
                </div>
                <span className="font-black text-2xl tracking-tight">UAE LAW GUIDE</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
                The most comprehensive digital gateway to United Arab Emirates laws, regulations, and filing procedures. Empowering residents and businesses with legal clarity.
              </p>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-uae-gold shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-sm mb-1 text-white">Important Notice</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This is <span className="text-white font-medium">not an official government website</span>. Information provided may be outdated or incorrect. For the latest official updates and guidelines, please refer to the respective government portals listed here.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Official Portals</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><a href="https://u.ae" target="_blank" rel="noopener noreferrer" className="hover:text-uae-gold transition-colors flex items-center gap-2">UAE Government (u.ae) <ExternalLink className="w-3 h-3" /></a></li>
                <li><a href="https://www.moj.gov.ae" target="_blank" rel="noopener noreferrer" className="hover:text-uae-gold transition-colors flex items-center gap-2">Ministry of Justice <ExternalLink className="w-3 h-3" /></a></li>
                <li><a href="https://www.mohre.gov.ae" target="_blank" rel="noopener noreferrer" className="hover:text-uae-gold transition-colors flex items-center gap-2">MOHRE Portal <ExternalLink className="w-3 h-3" /></a></li>
                <li><a href="https://tax.gov.ae" target="_blank" rel="noopener noreferrer" className="hover:text-uae-gold transition-colors flex items-center gap-2">Federal Tax Authority <ExternalLink className="w-3 h-3" /></a></li>
                <li><a href="https://icp.gov.ae" target="_blank" rel="noopener noreferrer" className="hover:text-uae-gold transition-colors flex items-center gap-2">ICP (Visa & Identity) <ExternalLink className="w-3 h-3" /></a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><button onClick={handleBack} className="hover:text-uae-gold transition-colors">Home Dashboard</button></li>
                <li><button onClick={() => setIsChatOpen(true)} className="hover:text-uae-gold transition-colors">Legal AI Assistant</button></li>
                <li><a href="#" className="hover:text-uae-gold transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-uae-gold transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-500 font-medium">
              © {new Date().getFullYear()} UAE Law Guide. Designed for legal clarity and accessibility.
            </p>
            <div className="flex gap-6">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-uae-gold/10 transition-colors cursor-pointer group">
                <Scale className="w-4 h-4 text-slate-500 group-hover:text-uae-gold" />
              </div>
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-uae-gold/10 transition-colors cursor-pointer group">
                <ShieldAlert className="w-4 h-4 text-slate-500 group-hover:text-uae-gold" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
