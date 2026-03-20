import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  BarChart3, 
  BookOpen, 
  Search, 
  Send, 
  User, 
  Bot, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Clock,
  CheckCircle2,
  Youtube,
  ArrowLeft,
  Image as ImageIcon,
  X,
  Play,
  Pause,
  Headphones,
  Video,
  Upload,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import Mermaid from './components/Mermaid';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  getAIResponse, 
  getPracticeQuestions, 
  getTopicNotes, 
  searchWebQuestions, 
  getRealTimeAnalytics, 
  getRecommendedVideos,
  getTopicAudio,
  TopicNotes
} from './services/aiService';
import { Message, ExamTrend, SyllabusItem, PracticeQuestion, StudyProgress } from './types';
import { cn } from './lib/utils';

// Mock Data
const MOCK_TRENDS: ExamTrend[] = [
  { subject: 'Teaching (How to teach)', weightage: 15, trend: 'stable' },
  { subject: 'Research (How to find facts)', weightage: 18, trend: 'up' },
  { subject: 'Logic (Common Sense)', weightage: 20, trend: 'up' },
  { subject: 'Money & Finance', weightage: 22, trend: 'up' },
  { subject: 'Accounts & Auditing', weightage: 18, trend: 'stable' },
  { subject: 'Business Surroundings', weightage: 15, trend: 'down' },
];

const MOCK_SYLLABUS_P1: SyllabusItem[] = [
  { unit: 'Unit-I: Teaching (How to teach)', topics: ['Basic ideas and goals', 'How students learn', 'What makes teaching good or bad', 'Different ways to teach'] },
  { unit: 'Unit-II: Research (How to find facts)', topics: ['What is research?', 'Scientific ways to find facts', 'Steps in research', 'How to write a report'] },
  { unit: 'Unit-III: Reading (Understanding)', topics: ['Reading a story or passage', 'Answering simple questions'] },
  { unit: 'Unit-IV: Talking (Communication)', topics: ['How to talk and listen well', 'Good ways to share ideas', 'Problems in talking to others'] },
  { unit: 'Unit-V: Math & Numbers', topics: ['Simple logic', 'Number and letter patterns', 'Basic math (Time, Distance, Profit, Loss, Average)'] },
  { unit: 'Unit-VI: Logic (Common Sense)', topics: ['Understanding arguments', 'Good and bad reasoning', 'Simple diagrams (Venn)', 'Indian ways of knowing'] },
  { unit: 'Unit-VII: Charts & Data', topics: ['Collecting and sorting info', 'Simple charts (Bar, Pie, Line)', 'Understanding what charts say', 'Data and how things are run'] },
  { unit: 'Unit-VIII: Computers (ICT)', topics: ['Basic computer words', 'Internet, Email, and Video calls', 'Online learning in colleges', 'Computers and how things are run'] },
  { unit: 'Unit-IX: People & Nature', topics: ['How we live with nature', 'Nature problems (Pollution)', 'How pollution hurts us', 'Saving our nature (Laws)', 'Natural disasters'] },
  { unit: 'Unit-X: College System', topics: ['Old Indian schools', 'How colleges grew in India', 'Different types of learning', 'Values and nature learning', 'Rules and how colleges are run'] },
];

const MOCK_SYLLABUS_P2_COMMERCE: SyllabusItem[] = [
  { unit: 'Unit-I: Business Surroundings', topics: ['Basic ideas of business environment', 'Money environment', 'Rules and Laws', 'Global Business (Selling to other countries)'] },
  { unit: 'Unit-II: Accounts & Checking', topics: ['Basic money rules', 'Partnership business accounts', 'Company accounts', 'Cost and management accounts', 'Checking accounts (Auditing)'] },
  { unit: 'Unit-III: Business Economics', topics: ['What is business economics?', 'Goals of a business', 'Why people buy things (Demand)', 'How much to produce', 'Setting prices'] },
  { unit: 'Unit-IV: Business Finance (Money)', topics: ['Where to get money for business', 'Renting equipment (Leasing)', 'Value of money over time', 'Capital structure', 'Big spending decisions'] },
  { unit: 'Unit-V: Business Math & Research', topics: ['Finding the average', 'How data is spread out', 'Relationships between numbers', 'Chance (Probability)', 'How to do research'] },
  { unit: 'Unit-VI: Management & People (HRM)', topics: ['Rules of managing a business', 'How a company is built', 'Who is in charge', 'Making people work well (Motivation)', 'Managing workers (HRM)'] },
  { unit: 'Unit-VII: Banks & Money Places', topics: ['Indian money system', 'Different types of banks', 'Reserve Bank of India (RBI)', 'Bank changes', 'Money markets'] },
  { unit: 'Unit-VIII: Selling (Marketing)', topics: ['Basic ideas of selling', 'The 4 Ps of marketing', 'Product and price choices', 'How to promote things', 'How buyers think'] },
  { unit: 'Unit-IX: Business Laws', topics: ['Contract rules (1872)', 'Selling goods rules (1930)', 'Company rules (2013)', 'Computer and IT rules (2000)', 'Right to info (RTI)'] },
  { unit: 'Unit-X: Taxes', topics: ['Basic tax ideas', 'Who has to pay tax', 'Income that is free from tax', 'How to calculate tax', 'Saving tax legally'] },
];

const ANALYTICS_DATA = [
  { day: 'Mon', score: 65 },
  { day: 'Tue', score: 72 },
  { day: 'Wed', score: 68 },
  { day: 'Thu', score: 85 },
  { day: 'Fri', score: 78 },
  { day: 'Sat', score: 92 },
  { day: 'Sun', score: 88 },
];

const YEARLY_TRENDS_DATA = [
  { year: '2021', 'Teaching': 12, 'Research': 14, 'Logical': 18, 'Finance': 20 },
  { year: '2022', 'Teaching': 14, 'Research': 16, 'Logical': 19, 'Finance': 21 },
  { year: '2023', 'Teaching': 15, 'Research': 18, 'Logical': 20, 'Finance': 22 },
  { year: '2024', 'Teaching': 15, 'Research': 19, 'Logical': 21, 'Finance': 23 },
];

const MOCK_PYQS = [
  { 
    year: '2023', 
    paper: 'Paper 1', 
    questions: [
      { 
        id: 1, 
        question: 'What makes a teacher good at their job?', 
        options: ['A) Only the teacher talks', 'B) Using many different ways to teach', 'C) Being very strict', 'D) Only reading from the book'], 
        answer: 'B', 
        description: 'A good teacher uses different ways to help all kinds of students learn easily.' 
      },
      {
        id: 2,
        question: 'In research, what is "Positivism"?',
        options: ['A) Looking at feelings', 'B) Looking at real facts and proof', 'C) Looking at personal stories', 'D) Looking at old history'],
        answer: 'B',
        description: 'Positivism means finding the truth using real facts and scientific proof that everyone can see.'
      }
    ]
  },
  { 
    year: '2022', 
    paper: 'Paper 1', 
    questions: [
      { 
        id: 1, 
        question: 'Why do we do research?', 
        options: ['A) To prove what we already think', 'B) To just collect papers', 'C) To find out new things', 'D) To just write a big book'], 
        answer: 'C', 
        description: 'We do research to find new information and learn things we didn\'t know before.' 
      },
      {
        id: 2,
        question: 'What stops people from talking well to each other?',
        options: ['A) Listening carefully', 'B) Using easy words', 'C) Being upset or angry', 'D) Getting an answer back'],
        answer: 'C',
        description: 'If you are upset or angry, it is hard to understand what someone else is saying. This is called psychological noise.'
      }
    ]
  },
  { 
    year: '2021', 
    paper: 'Paper 1', 
    questions: [
      { 
        id: 1, 
        question: 'Which of these is a way to learn online in college?', 
        options: ['A) Using a blackboard', 'B) Using paper books', 'C) Using online courses (MOOCs)', 'D) Using hand-written notes'], 
        answer: 'C', 
        description: 'Online courses like MOOCs let many people learn from anywhere using the internet.' 
      }
    ]
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'syllabus' | 'practice' | 'pyqs'>('chat');
  const [selectedPaper, setSelectedPaper] = useState<'p1' | 'p2'>('p1');
  const [selectedPYQYear, setSelectedPYQYear] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Practice State
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notes State
  const [selectedTopic, setSelectedTopic] = useState<{topic: string, unit: string} | null>(null);
  const [topicNotes, setTopicNotes] = useState<TopicNotes | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // AI Avatar State
  const [aiAvatar, setAiAvatar] = useState<string>(() => {
    return localStorage.getItem('ai_avatar') || "https://www.shutterstock.com/shutterstock/photos/1640988532/display_1500/stock-vector-illustration-of-a-yogi-meditating-in-lotus-position-cartoon-character-of-an-old-man-with-a-beard-1640988532.jpg";
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(aiAvatar);
  const settingsFileInputRef = useRef<HTMLInputElement>(null);

  // Video Player State
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

  // Study Progress
  const [progress, setProgress] = useState<StudyProgress>({
    totalAttempted: 0,
    totalCorrect: 0,
    unitPerformance: {},
    recentScores: []
  });

  useEffect(() => {
    const savedProgress = localStorage.getItem('study_progress');
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error("Failed to parse progress:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('study_progress', JSON.stringify(progress));
  }, [progress]);

  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  };

  // Web Search State
  const [webSearchQuery, setWebSearchQuery] = useState('');
  const [webSearchResults, setWebSearchResults] = useState<{text: string, groundingChunks?: any[]} | null>(null);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);

  // Dashboard State
  const [realTimeAnalytics, setRealTimeAnalytics] = useState<{trends: ExamTrend[], insights: string[], yearlyData: any[]} | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      const fetchDashboardData = async () => {
        setIsLoadingDashboard(true);
        try {
          const [analytics, videos] = await Promise.all([
            getRealTimeAnalytics(selectedPaper),
            getRecommendedVideos(selectedPaper)
          ]);
          setRealTimeAnalytics(analytics);
          setRecommendedVideos(videos);
        } catch (error) {
          console.error("Dashboard fetch error:", error);
        } finally {
          setIsLoadingDashboard(false);
        }
      };
      fetchDashboardData();
    }
  }, [activeTab, selectedPaper]);

  const handleWebSearch = async () => {
    if (!webSearchQuery.trim()) return;
    setIsSearchingWeb(true);
    setWebSearchResults(null);
    try {
      const results = await searchWebQuestions(webSearchQuery);
      setWebSearchResults(results);
    } catch (error) {
      console.error(error);
      setWebSearchResults({ text: "Failed to find questions on the web. Please try a different query." });
    } finally {
      setIsSearchingWeb(false);
    }
  };

  const handleTopicClick = async (topic: string, unit: string) => {
    setSelectedTopic({ topic, unit });
    setIsLoadingNotes(true);
    setTopicNotes(null);
    setAudioData(null);
    try {
      const notes = await getTopicNotes(topic, unit);
      setTopicNotes(notes);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleSaveSettings = () => {
    setAiAvatar(newAvatarUrl);
    localStorage.setItem('ai_avatar', newAvatarUrl);
    setIsSettingsOpen(false);
  };

  const handleSettingsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlayAudio = async () => {
    if (!topicNotes?.podcastScript || isGeneratingAudio) return;
    
    if (audioData) {
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audio.play();
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const data = await getTopicAudio(topicNotes.podcastScript);
      if (data) {
        setAudioData(data);
        const audio = new Audio(`data:audio/mp3;base64,${data}`);
        audio.play();
      }
    } catch (error) {
      console.error("Failed to generate audio:", error);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setSelectedImage(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input || "Analyze this question image",
      timestamp: Date.now(),
      imageData: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: m.imageData ? [
          { text: m.text },
          { inlineData: { data: m.imageData.split(',')[1], mimeType: 'image/png' } }
        ] : [{ text: m.text }]
      }));

      const response = await getAIResponse(currentInput || "Analyze this question image", history, currentImage || undefined);
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I'm sorry, I couldn't process that.",
        timestamp: Date.now(),
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Error: Failed to connect to the AI coach. Please check your API key.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePractice = async () => {
    setIsGeneratingPractice(true);
    try {
      const questions = await getPracticeQuestions(selectedPaper);
      setPracticeQuestions(questions);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setScore(0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingPractice(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswerSubmitted) return;
    
    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctOption;
    
    setIsAnswerSubmitted(true);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Update Progress
    setProgress(prev => {
      const unit = currentQuestion.subject || 'General';
      const unitStats = prev.unitPerformance[unit] || { attempted: 0, correct: 0 };
      
      return {
        ...prev,
        totalAttempted: prev.totalAttempted + 1,
        totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect,
        unitPerformance: {
          ...prev.unitPerformance,
          [unit]: {
            attempted: unitStats.attempted + 1,
            correct: isCorrect ? unitStats.correct + 1 : unitStats.correct
          }
        }
      };
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Test Finished - Save to recent scores
      const newRecentScore = {
        date: new Date().toLocaleDateString(),
        score: score,
        total: practiceQuestions.length
      };
      
      setProgress(prev => ({
        ...prev,
        recentScores: [newRecentScore, ...prev.recentScores].slice(0, 10)
      }));
      
      // Reset
      setPracticeQuestions([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-tiranga-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Tiranga Header */}
      <div className="h-1 bg-tiranga-saffron w-full" />
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="bg-tiranga-navy rounded-xl overflow-hidden w-10 h-10 flex items-center justify-center border-2 border-tiranga-saffron/20 shadow-inner hover:scale-105 transition-transform"
          >
            <img 
              src={aiAvatar || undefined} 
              alt="Guruji Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-tiranga-navy dark:text-tiranga-saffron">Exam Guruji Pro</h1>
            <p className="text-[10px] text-tiranga-saffron dark:text-tiranga-white font-bold uppercase tracking-widest">Your Friendly Exam Teacher</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl transition-colors">
            <button 
              onClick={() => setActiveTab('chat')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'chat' ? "bg-tiranga-saffron text-white shadow-md" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <MessageSquare size={16} />
              Talk to Guru
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'dashboard' ? "bg-tiranga-navy text-white shadow-md" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <BarChart3 size={16} />
              My Progress
            </button>
            <button 
              onClick={() => setActiveTab('syllabus')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'syllabus' ? "bg-tiranga-green text-white shadow-md" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <BookOpen size={16} />
              What to Study
            </button>
            <button 
              onClick={() => setActiveTab('practice')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'practice' ? "bg-amber-500 text-white shadow-md" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <CheckCircle2 size={16} />
              Daily Questions
            </button>
            <button 
              onClick={() => setActiveTab('pyqs')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'pyqs' ? "bg-indigo-600 text-white shadow-md" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <Clock size={16} />
              Ready Answers
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <div className="w-10 h-10 rounded-full bg-tiranga-navy/10 dark:bg-tiranga-saffron/10 flex items-center justify-center text-tiranga-navy dark:text-tiranga-saffron">
              <User size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col max-w-4xl mx-auto w-full"
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative cursor-pointer"
                      onClick={() => setIsSettingsOpen(true)}
                    >
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl ring-4 ring-tiranga-navy/10">
                        <img 
                          src={aiAvatar || undefined} 
                          alt="Guruji" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-tiranga-green text-white p-3 rounded-2xl shadow-lg border-4 border-white">
                        <GraduationCap size={24} />
                      </div>
                    </motion.div>
                    
                    <div className="space-y-2">
                      <h3 className="font-bold text-2xl text-tiranga-navy dark:text-tiranga-saffron">Namaste! I am your Guru.</h3>
                      <p className="max-w-sm text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                        I can help you with Paper 1 and Commerce. What do you want to learn today?
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                      {["Explain Teaching", "Commerce 2023 Questions", "Money & Finance trends", "Accounting notes"].map(q => (
                        <button 
                          key={q}
                          onClick={() => {
                            setInput(q);
                          }}
                          className="text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-tiranga-saffron hover:bg-indigo-50 dark:hover:bg-zinc-900 transition-all text-xs font-medium dark:text-zinc-300"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex gap-4 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border-2",
                      msg.role === 'user' ? "bg-tiranga-saffron/20 text-tiranga-saffron border-tiranga-saffron/10" : "bg-tiranga-navy border-tiranga-navy/10"
                    )}>
                      {msg.role === 'user' ? (
                        <User size={20} />
                      ) : (
                        <img 
                          src={aiAvatar || undefined} 
                          alt="Guruji" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm shadow-sm",
                      msg.role === 'user' ? "bg-tiranga-navy text-white rounded-tr-none" : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-none dark:text-zinc-100"
                    )}>
                      {msg.imageData && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-white/20">
                          <img src={msg.imageData || undefined} alt="Uploaded question" className="max-w-full h-auto" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div className="markdown-body prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            a({ node, href, children, ...props }: any) {
                              if (href && (href.includes('youtube.com') || href.includes('youtu.be'))) {
                                return (
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setPlayingVideoUrl(href);
                                    }}
                                    className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 inline-flex"
                                  >
                                    <Youtube size={16} />
                                    {children}
                                  </button>
                                );
                              }
                              return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                            },
                            code({ node, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isMermaid = match && match[1] === 'mermaid';
                              
                              if (isMermaid) {
                                return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                              }
                              return (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                      
                      {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                          <p className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-widest">Where I found this</p>
                          <div className="flex flex-wrap gap-2">
                            {msg.groundingChunks.map((chunk, idx) => (
                              chunk.web && (
                                <a 
                                  key={idx}
                                  href={chunk.web.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[10px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-400 transition-colors"
                                >
                                  <ExternalLink size={10} />
                                  {chunk.web.title || 'Source'}
                                </a>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 max-w-[85%] animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0 overflow-hidden">
                       <img 
                          src={aiAvatar || undefined} 
                          alt="Guruji" 
                          className="w-full h-full object-cover grayscale opacity-50"
                          referrerPolicy="no-referrer"
                        />
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-none w-full">
                      <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
                {selectedImage && (
                  <div className="mb-4 relative inline-block">
                    <img src={selectedImage || undefined} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-tiranga-saffron" referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <div className="relative flex items-center gap-2">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                    title="Upload question photo"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      onPaste={handlePaste}
                      placeholder="Ask a question or paste a photo..."
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-all"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={isLoading || (!input.trim() && !selectedImage)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-tiranga-navy text-white rounded-xl hover:bg-tiranga-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-center mt-3 text-zinc-400 dark:text-zinc-500 font-medium">
                  Guru can help with any question. Just paste a photo or type your question.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full overflow-y-auto p-8 max-w-6xl mx-auto w-full space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                    title="Back to Guru"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Study Progress</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Latest trends for {selectedPaper === 'p1' ? 'Paper 1' : 'Commerce P2'}</p>
                  </div>
                </div>

                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-start transition-colors">
                  <button 
                    onClick={() => setSelectedPaper('p1')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      selectedPaper === 'p1' ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-tiranga-saffron shadow-sm" : "text-zinc-500 dark:text-zinc-400"
                    )}
                  >
                    Paper 1
                  </button>
                  <button 
                    onClick={() => setSelectedPaper('p2')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      selectedPaper === 'p2' ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-tiranga-saffron shadow-sm" : "text-zinc-500 dark:text-zinc-400"
                    )}
                  >
                    Commerce P2
                  </button>
                </div>
              </div>

              {isLoadingDashboard ? (
                <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-zinc-500 font-medium animate-pulse">Analyzing real-time exam trends and fetching recommendations...</p>
                </div>
              ) : (
                <>
                  {/* Performance Report */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors">
                      <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Total Attempted</p>
                      <h4 className="text-3xl font-bold text-tiranga-navy dark:text-tiranga-saffron">{progress.totalAttempted}</h4>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors">
                      <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Accuracy</p>
                      <h4 className="text-3xl font-bold text-tiranga-green">
                        {progress.totalAttempted > 0 ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100) : 0}%
                      </h4>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors">
                      <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Tests Completed</p>
                      <h4 className="text-3xl font-bold text-tiranga-saffron">{progress.recentScores.length}</h4>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors">
                      <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Study Level</p>
                      <h4 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {progress.totalAttempted > 100 ? 'Expert' : progress.totalAttempted > 50 ? 'Intermediate' : 'Beginner'}
                      </h4>
                    </div>
                  </div>

                  {/* Weakness Analysis */}
                  {Object.keys(progress.unitPerformance).length > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-3xl border border-red-100 dark:border-red-900/30 transition-colors">
                      <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-4 flex items-center gap-2">
                        <X className="text-red-500" />
                        Topics to Improve
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(progress.unitPerformance)
                          .map(([unit, stats]: [string, any]) => ({
                            unit,
                            accuracy: Math.round((stats.correct / stats.attempted) * 100)
                          }))
                          .filter(item => item.accuracy < 70)
                          .sort((a, b) => a.accuracy - b.accuracy)
                          .slice(0, 3)
                          .map(item => (
                            <div key={item.unit} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm transition-colors">
                              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mb-1">{item.unit}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-red-600 dark:text-red-400">{item.accuracy}% Correct</span>
                                <button 
                                  onClick={() => {
                                    setActiveTab('chat');
                                    setInput(`Explain ${item.unit} concepts and provide PYQs.`);
                                  }}
                                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  Learn More
                                </button>
                              </div>
                              <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full" style={{ width: `${item.accuracy}%` }} />
                              </div>
                            </div>
                          ))}
                        {Object.entries(progress.unitPerformance).filter(([_, stats]: [string, any]) => (stats.correct / stats.attempted) < 0.7).length === 0 && (
                          <div className="col-span-full text-center py-4">
                            <p className="text-sm text-tiranga-green font-bold">Great job! You are doing well in all topics.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Performance History Chart */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 transition-colors">
                      <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <TrendingUp className="text-tiranga-green" />
                        My Test Scores
                      </h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={progress.recentScores.length > 0 
                            ? [...progress.recentScores].reverse() 
                            : ANALYTICS_DATA.map(d => ({ date: d.day, score: d.score, total: 100 }))}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#333" : "#f0f0f0"} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#666' : '#888' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#666' : '#888' }} />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                backgroundColor: isDarkMode ? '#18181b' : '#fff',
                                color: isDarkMode ? '#fff' : '#000'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#138808" 
                              strokeWidth={3} 
                              dot={{ r: 4 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Weightage Chart */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 transition-colors">
                      <h3 className="font-bold text-lg mb-6 text-zinc-900 dark:text-zinc-100">Important Topics for Exam</h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={realTimeAnalytics?.trends || MOCK_TRENDS} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? "#333" : "#f0f0f0"} />
                            <XAxis type="number" hide />
                            <YAxis 
                              dataKey="subject" 
                              type="category" 
                              axisLine={false} 
                              tickLine={false} 
                              width={120}
                              tick={{ fontSize: 11, fill: isDarkMode ? '#aaa' : '#555', fontWeight: 500 }}
                            />
                            <Tooltip 
                              cursor={{ fill: 'transparent' }}
                              contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                backgroundColor: isDarkMode ? '#18181b' : '#fff',
                                color: isDarkMode ? '#fff' : '#000'
                              }}
                            />
                            <Bar dataKey="weightage" radius={[0, 8, 8, 0]} barSize={20}>
                              {(realTimeAnalytics?.trends || MOCK_TRENDS).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.trend === 'up' ? '#138808' : entry.trend === 'down' ? '#FF9933' : '#000080'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Trend Analysis & Predictions */}
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-3xl shadow-xl text-white">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                        <TrendingUp size={24} className="text-tiranga-saffron" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">AI Trend Analysis & Predictions</h3>
                        <p className="text-indigo-100/70 text-sm">Looking at the last 5 years to guess what will be asked next.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-tiranga-saffron mb-2">Most Asked Topics</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-tiranga-saffron rounded-full" />
                            Indian Logic (Pramanas)
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-tiranga-saffron rounded-full" />
                            Nature Saving Goals (SDGs)
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-tiranga-saffron rounded-full" />
                            Computers in Colleges
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-tiranga-green mb-2">New Important Topics</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-tiranga-green rounded-full" />
                            New Education Policy (NEP 2020)
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-tiranga-green rounded-full" />
                            AI in Research
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-tiranga-green rounded-full" />
                            Weather Change Rules
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-indigo-300 mb-2">Guruji's Guess for Next Exam</h4>
                        <p className="text-xs leading-relaxed text-indigo-100">
                          Expect more questions on **Common Sense (Indian Logic)** and **Teaching with Computers**. Focus on **Nature and Rules**.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logic Insights */}
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-3xl shadow-xl text-white">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <Bot className="text-tiranga-saffron" />
                      AI Simple Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {realTimeAnalytics?.insights.map((insight, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="shrink-0 w-8 h-8 rounded-full bg-tiranga-navy flex items-center justify-center font-bold text-xs">
                            {i + 1}
                          </div>
                          <p className="text-sm text-zinc-300 leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Videos */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Youtube className="text-red-600" />
                      Helpful Video Lessons
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendedVideos.map((video, i) => (
                        <div 
                          key={i}
                          onClick={() => setPlayingVideoUrl(video.url)}
                          className="group bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                        >
                          <div className="aspect-video bg-zinc-100 relative overflow-hidden">
                            <img 
                              src={video.thumbnail || `https://picsum.photos/seed/${video.title}/640/360`} 
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-red-600 shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                                <Youtube size={24} />
                              </div>
                            </div>
                          </div>
                          <div className="p-6 space-y-2">
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{video.channel}</p>
                            <h4 className="font-bold text-zinc-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">{video.title}</h4>
                            <p className="text-xs text-zinc-500 line-clamp-2">{video.description}</p>
                            <div className="pt-4 flex items-center gap-2 text-indigo-600 font-bold text-xs">
                              Watch Now <ExternalLink size={12} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'syllabus' && (
            <motion.div 
              key="syllabus"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto p-8 max-w-4xl mx-auto w-full"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-400 hover:text-zinc-800"
                    title="Back to Coach"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">NTA UGC NET Syllabus</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                      {selectedPaper === 'p1' ? 'Paper 1: Teaching and Research (How to teach and find facts)' : 'Paper 2: Commerce (Business and Money)'}
                    </p>
                  </div>
                </div>
                
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-start transition-colors">
                  <button 
                    onClick={() => setSelectedPaper('p1')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      selectedPaper === 'p1' ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-tiranga-saffron shadow-sm" : "text-zinc-500 dark:text-zinc-400"
                    )}
                  >
                    Paper 1
                  </button>
                  <button 
                    onClick={() => setSelectedPaper('p2')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      selectedPaper === 'p2' ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-tiranga-saffron shadow-sm" : "text-zinc-500 dark:text-zinc-400"
                    )}
                  >
                    Commerce P2
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {(selectedPaper === 'p1' ? MOCK_SYLLABUS_P1 : MOCK_SYLLABUS_P2_COMMERCE).map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors">
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between transition-colors">
                      <h3 className="font-bold text-zinc-800 dark:text-zinc-200">{item.unit}</h3>
                      <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full uppercase">Core Unit</span>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-3">
                        {item.topics.map((topic, tIdx) => (
                          <li 
                            key={tIdx} 
                            onClick={() => handleTopicClick(topic, item.unit)}
                            className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400 group cursor-pointer"
                          >
                            <div className="mt-1 p-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                              <ChevronRight size={12} className="text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                            </div>
                            <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-medium">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-8 bg-tiranga-green rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Want to try a Test?</h3>
                  <p className="text-zinc-100 text-sm mb-6 max-w-md">See how much you know with our Guru's tests.</p>
                  <button 
                    onClick={() => {
                      setActiveTab('practice');
                      handleGeneratePractice();
                    }}
                    className="bg-white text-tiranga-green px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-colors"
                  >
                    Start Test
                  </button>
                </div>
                <GraduationCap className="absolute -right-8 -bottom-8 w-48 h-48 text-white/20 -rotate-12" />
              </div>
            </motion.div>
          )}
          {activeTab === 'practice' && (
            <motion.div 
              key="practice"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full overflow-y-auto p-8 max-w-4xl mx-auto w-full"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      if (practiceQuestions.length > 0) {
                        setPracticeQuestions([]);
                      } else {
                        setActiveTab('chat');
                      }
                    }}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-400 hover:text-zinc-800"
                    title={practiceQuestions.length > 0 ? "Go Back" : "Back to Guru"}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Daily Questions</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">15 Questions based on what's important</p>
                  </div>
                </div>
                
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-start transition-colors">
                  <button 
                    onClick={() => setSelectedPaper('p1')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      selectedPaper === 'p1' ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-tiranga-saffron shadow-sm" : "text-zinc-500 dark:text-zinc-400"
                    )}
                  >
                    Paper 1
                  </button>
                  <button 
                    onClick={() => setSelectedPaper('p2')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      selectedPaper === 'p2' ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-tiranga-saffron shadow-sm" : "text-zinc-500 dark:text-zinc-400"
                    )}
                  >
                    Commerce P2
                  </button>
                </div>
              </div>

              {/* Web Search for Questions */}
              <div className="mb-12 bg-gradient-to-br from-tiranga-navy to-indigo-900 p-8 rounded-3xl shadow-xl text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                    <Search size={24} className="text-tiranga-saffron" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Search for Questions Online</h3>
                    <p className="text-indigo-100/70 text-sm">Find more questions on any topic from the internet.</p>
                  </div>
                </div>
                
                <div className="relative flex items-center gap-3">
                  <input 
                    type="text"
                    value={webSearchQuery}
                    onChange={(e) => setWebSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleWebSearch()}
                    placeholder="e.g., Teaching questions 2024, Maths questions..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-tiranga-saffron transition-all placeholder:text-indigo-200/50"
                  />
                  <button 
                    onClick={handleWebSearch}
                    disabled={isSearchingWeb || !webSearchQuery.trim()}
                    className="bg-tiranga-saffron text-white px-8 py-4 rounded-2xl font-bold hover:bg-tiranga-saffron/90 transition-all disabled:opacity-50 shadow-lg shadow-tiranga-saffron/20"
                  >
                    {isSearchingWeb ? 'Looking...' : 'Find Online'}
                  </button>
                </div>

                {webSearchResults && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 p-8 rounded-2xl shadow-inner max-h-[500px] overflow-y-auto transition-colors"
                  >
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4 transition-colors">
                      <h4 className="font-bold text-lg text-tiranga-navy dark:text-tiranga-saffron">What I found online</h4>
                      <button 
                        onClick={() => setWebSearchResults(null)}
                        className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="markdown-body prose prose-sm max-w-none">
                      <ReactMarkdown>{webSearchResults.text}</ReactMarkdown>
                    </div>
                    {webSearchResults.groundingChunks && webSearchResults.groundingChunks.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 transition-colors">
                        <p className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-widest mb-3">Where I found this</p>
                        <div className="flex flex-wrap gap-2">
                          {webSearchResults.groundingChunks.map((chunk: any, i: number) => (
                            chunk.web && (
                              <a 
                                key={i}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-[10px] font-medium text-zinc-600 dark:text-zinc-400 transition-all"
                              >
                                <ExternalLink size={10} />
                                {chunk.web.title || 'Source'}
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {practiceQuestions.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center space-y-6 transition-colors">
                  <div className="bg-amber-50 dark:bg-amber-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-colors">
                    <CheckCircle2 className="text-amber-500 w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Start Your Daily Practice</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto mt-2">
                      Get 15 questions from different units of the {selectedPaper === 'p1' ? 'Paper 1' : 'Commerce'} syllabus.
                    </p>
                  </div>
                  <button 
                    onClick={handleGeneratePractice}
                    disabled={isGeneratingPractice}
                    className="bg-tiranga-navy dark:bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-tiranga-navy/90 dark:hover:bg-indigo-500 transition-all disabled:opacity-50"
                  >
                    {isGeneratingPractice ? 'Generating Questions...' : 'Generate 15 Questions'}
                  </button>
                </div>
              ) : (
                <div className="space-y-8 pb-12">
                  <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-tiranga-navy dark:bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                        {currentQuestionIndex + 1}/{practiceQuestions.length}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-widest">Current Unit</p>
                        <p className="text-sm font-bold text-tiranga-navy dark:text-tiranga-saffron">{practiceQuestions[currentQuestionIndex].subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-widest">Score</p>
                      <p className="text-sm font-bold text-tiranga-green">{score} Correct</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 transition-colors">
                    <h3 className="text-lg font-bold leading-relaxed text-zinc-900 dark:text-zinc-100">
                      {practiceQuestions[currentQuestionIndex].question}
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                      {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                        <button
                          key={opt}
                          disabled={isAnswerSubmitted}
                          onClick={() => setSelectedOption(opt)}
                          className={cn(
                            "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4",
                            selectedOption === opt 
                              ? "border-tiranga-navy dark:border-indigo-500 bg-tiranga-navy/5 dark:bg-indigo-500/10" 
                              : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700",
                            isAnswerSubmitted && opt === practiceQuestions[currentQuestionIndex].correctOption
                              ? "border-tiranga-green bg-tiranga-green/5 text-tiranga-green"
                              : isAnswerSubmitted && selectedOption === opt && opt !== practiceQuestions[currentQuestionIndex].correctOption
                                ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400"
                                : ""
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0",
                            selectedOption === opt ? "bg-tiranga-navy dark:bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          )}>
                            {opt}
                          </div>
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">{practiceQuestions[currentQuestionIndex].options[opt]}</span>
                        </button>
                      ))}
                    </div>

                    {!isAnswerSubmitted ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOption}
                        className="w-full bg-tiranga-navy dark:bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-tiranga-navy/90 dark:hover:bg-indigo-500 transition-all disabled:opacity-50"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4 transition-colors">
                          <div className="flex items-center gap-2 text-tiranga-navy dark:text-tiranga-saffron font-bold">
                            <CheckCircle2 size={20} />
                            Simple Explanation
                          </div>
                          <div className="markdown-body text-zinc-600 dark:text-zinc-400">
                            <ReactMarkdown>{practiceQuestions[currentQuestionIndex].explanation}</ReactMarkdown>
                          </div>
                          
                          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 font-bold text-xs uppercase tracking-wider mb-2">
                              Why other options are wrong?
                            </div>
                            <div className="markdown-body text-zinc-500 dark:text-zinc-500 italic">
                              <ReactMarkdown>{practiceQuestions[currentQuestionIndex].otherOptionsExplanation}</ReactMarkdown>
                            </div>
                          </div>

                          {practiceQuestions[currentQuestionIndex].mindmap && (
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Concept Mind Map</p>
                              <Mermaid chart={practiceQuestions[currentQuestionIndex].mindmap} />
                            </div>
                          )}

                          {practiceQuestions[currentQuestionIndex].videoLink && (
                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
                              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider mb-2">
                                <Youtube size={16} />
                                Recommended Video Lecture
                              </div>
                              <button 
                                onClick={() => setPlayingVideoUrl(practiceQuestions[currentQuestionIndex].videoLink)}
                                className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all group text-left"
                              >
                                <div className="bg-red-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                                  <Youtube size={20} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-red-900 dark:text-red-400">Watch Video Explanation</p>
                                  <p className="text-[10px] text-red-600 dark:text-red-500 font-medium">Available in Hindi/English</p>
                                </div>
                                <ExternalLink size={14} className="ml-auto text-red-400 dark:text-red-500" />
                              </button>
                            </div>
                          )}

                          {practiceQuestions[currentQuestionIndex].source && (
                            <div className="pt-4 flex items-center gap-2">
                              <ExternalLink size={14} className="text-zinc-400 dark:text-zinc-500" />
                              <a 
                                href={practiceQuestions[currentQuestionIndex].source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                              >
                                Official Source Reference
                              </a>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleNextQuestion}
                          className="w-full bg-tiranga-green text-white py-4 rounded-2xl font-bold hover:bg-tiranga-green/90 transition-all flex items-center justify-center gap-2"
                        >
                          {currentQuestionIndex === practiceQuestions.length - 1 ? 'Finish Practice' : 'Next Question'}
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'pyqs' && (
            <motion.div 
              key="pyqs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto p-8 max-w-4xl mx-auto w-full"
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => {
                    if (selectedPYQYear) {
                      setSelectedPYQYear(null);
                    } else {
                      setActiveTab('chat');
                    }
                  }}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Previous Year Questions</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">Solved papers with detailed explanations</p>
                </div>
              </div>

              {!selectedPYQYear ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {MOCK_PYQS.map((pyq) => (
                    <button
                      key={pyq.year}
                      onClick={() => setSelectedPYQYear(pyq.year)}
                      className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all text-center group shadow-sm hover:shadow-md"
                    >
                      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Clock className="text-indigo-600 dark:text-indigo-400" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{pyq.year}</h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{pyq.paper}</p>
                      <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">
                        See Questions <ChevronRight size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{selectedPYQYear} Ready Answers</h3>
                      <p className="text-indigo-100/80">Paper 1: Teaching & Research (How to teach and find facts)</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl font-bold text-sm">
                      {MOCK_PYQS.find(p => p.year === selectedPYQYear)?.questions.length} Questions
                    </div>
                  </div>

                  <div className="space-y-6">
                    {MOCK_PYQS.find(p => p.year === selectedPYQYear)?.questions.map((q, idx) => (
                      <div key={q.id} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </span>
                          <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{q.question}</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt) => (
                            <div 
                              key={opt}
                              className={cn(
                                "p-4 rounded-2xl border transition-all text-sm font-medium",
                                opt.startsWith(q.answer) 
                                  ? "border-tiranga-green bg-tiranga-green/5 text-tiranga-green" 
                                  : "border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                              )}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>

                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-3 transition-colors">
                          <div className="flex items-center gap-2 text-tiranga-navy dark:text-tiranga-saffron font-bold text-sm">
                            <CheckCircle2 size={18} />
                            Answer & Easy Description
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {q.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Player Modal */}
        <AnimatePresence>
          {playingVideoUrl && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
              onClick={() => setPlayingVideoUrl(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setPlayingVideoUrl(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                >
                  <X size={24} />
                </button>
                {getYoutubeEmbedUrl(playingVideoUrl) ? (
                  <iframe 
                    src={getYoutubeEmbedUrl(playingVideoUrl)!}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video Player"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-4">
                    <Youtube size={64} className="text-red-600" />
                    <p className="text-lg font-bold">Sorry, this video link is not working.</p>
                    <a href={playingVideoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Try opening it on YouTube directly.</a>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsSettingsOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-8 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-tiranga-navy dark:text-tiranga-saffron">Guru Settings</h3>
                  <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-tiranga-navy/10 dark:border-zinc-800 shadow-lg transition-colors">
                        <img src={newAvatarUrl || undefined} alt="Avatar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <button 
                        onClick={() => settingsFileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white"
                      >
                        <Upload size={24} />
                      </button>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Guru's Photo</p>
                      <button 
                        onClick={() => settingsFileInputRef.current?.click()}
                        className="text-[10px] text-tiranga-navy dark:text-tiranga-saffron font-bold uppercase mt-1 hover:underline"
                      >
                        Change Photo
                      </button>
                      <input 
                        type="file" 
                        ref={settingsFileInputRef}
                        onChange={handleSettingsFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Guru's Photo Link</label>
                    <input 
                      type="text" 
                      value={newAvatarUrl}
                      onChange={(e) => setNewAvatarUrl(e.target.value)}
                      placeholder="Paste photo link here..."
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-tiranga-navy dark:focus:ring-indigo-500 transition-all text-zinc-900 dark:text-zinc-100"
                    />
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">Tip: You can use any photo link from the internet.</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setIsSettingsOpen(false)}
                      className="flex-1 py-3 rounded-xl font-bold text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveSettings}
                      className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-tiranga-navy dark:bg-indigo-600 hover:bg-tiranga-navy/90 dark:hover:bg-indigo-500 transition-all shadow-lg shadow-tiranga-navy/10"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Modal */}
        <AnimatePresence>
          {selectedTopic && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedTopic(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl transition-colors">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 transition-colors">{selectedTopic.topic}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest transition-colors">{selectedTopic.unit}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedTopic(null)}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                  {isLoadingNotes ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                      <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">Guru is writing easy notes for you...</p>
                    </div>
                  ) : topicNotes ? (
                    <div className="space-y-8">
                      {/* Multimedia Header */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-4">
                          <button 
                            onClick={handlePlayAudio}
                            disabled={isGeneratingAudio}
                            className="flex-1 bg-tiranga-navy dark:bg-indigo-600 text-white rounded-2xl p-6 flex items-center justify-center gap-4 hover:bg-tiranga-navy/90 dark:hover:bg-indigo-500 transition-all shadow-lg shadow-tiranga-navy/20 dark:shadow-indigo-900/20 group"
                          >
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              {isGeneratingAudio ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Headphones size={24} />
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-lg">Listen to Guru</p>
                              <p className="text-xs text-white/60">Guru and Arjun explain this topic</p>
                            </div>
                          </button>
                          
                          {topicNotes.videoUrl && (
                            <button 
                              onClick={() => setPlayingVideoUrl(topicNotes.videoUrl!)}
                              className="flex-1 bg-red-600 text-white rounded-2xl p-6 flex items-center justify-center gap-4 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 group"
                            >
                              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Video size={24} />
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-lg">Watch Video</p>
                                <p className="text-xs text-white/60">Easy video explanation</p>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="markdown-body prose prose-indigo dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            a({ node, href, children, ...props }: any) {
                              if (href && (href.includes('youtube.com') || href.includes('youtu.be'))) {
                                return (
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setPlayingVideoUrl(href);
                                    }}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold flex items-center gap-1 inline-flex"
                                  >
                                    <Youtube size={16} />
                                    {children}
                                  </button>
                                );
                              }
                              return <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline" {...props}>{children}</a>;
                            },
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              if (!inline && match && match[1] === 'mermaid') {
                                return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                              }
                              return (
                                <code className={cn(className, "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1 rounded transition-colors")} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {topicNotes.markdown}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                      <BookOpen size={48} className="mb-4 opacity-20" />
                      <p>Failed to load notes. Please try again.</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end transition-colors">
                  <button 
                    onClick={() => setSelectedTopic(null)}
                    className="px-6 py-2.5 bg-zinc-800 dark:bg-zinc-700 text-white rounded-xl font-bold text-sm hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-all shadow-lg"
                  >
                    Close Notes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* Tiranga Footer */}
      <div className="h-1 bg-tiranga-green w-full" />
    </div>
  );
}
