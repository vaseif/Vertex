import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, UserCog, Briefcase, MapPin, 
  ChevronRight, RefreshCw, X,
  GraduationCap, Globe, Clock, DollarSign,
  CheckCircle2, AlertCircle, Copy, Check,
  Languages, Zap, Send
} from 'lucide-react';
import { Job, UserProfile } from '../types';
import { supabase } from '../lib/supabase';

const HR_TEAM = [
  { id: 4, name: 'HR. Ziad Ramadan', phone: '201226979820' },
];

const languageLevels: Record<string, number> = {
  'A2': 0, 'B1': 1, 'B1+': 2, 'B2': 3, 'B2+': 4, 'C1': 5, 'C2': 6
};

const locationProximity: Record<string, string[]> = {
  'nasr-city': ['nasr-city', 'new-cairo', 'downtown', 'heliopolis'],
  'maadi': ['maadi', 'new-cairo', 'october city', 'sheikh-zayed'],
  'sheikh-zayed': ['sheikh-zayed', 'october city', 'new-cairo', '6th of october'],
  'new-cairo': ['new-cairo', 'nasr-city', 'heliopolis', 'maadi'],
  'downtown': ['downtown', 'nasr-city', 'garden city', 'zamalek'],
  'alexandria': ['alexandria', 'fleming'],
  'remote': ['remote', 'wfh', 'work from home'],
  'abbassia': ['abbassia', 'nasr-city', 'downtown'],
  'sheraton': ['sheraton', 'nasr-city', 'heliopolis'],
  'zahra2-maadi': ['zahra2-maadi', 'maadi'],
  'gisr-elsuez': ['gisr-elsuez', 'nasr-city'],
  'wfh': ['remote', 'wfh', 'work from home'],
  'any': ['nasr-city', 'maadi', 'sheikh-zayed', 'new-cairo', 'downtown', 'alexandria', 'remote']
};

export default function JobBoard() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    mobile: '',
    age: '',
    status: '',
    english: '',
    location: '',
    nationality: '',
    experience: '',
    experienceType: '',
    preferredShift: ''
  });

  const [ageError, setAgeError] = useState<string | null>(null);

  const isFormIncomplete = useMemo(() => {
    return (
      profile.name === '' ||
      profile.mobile === '' ||
      profile.age === '' ||
      profile.status === '' ||
      profile.english === '' ||
      profile.location === '' ||
      profile.nationality === '' ||
      profile.preferredShift === '' ||
      !!ageError
    );
  }, [profile, ageError]);

  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Hold'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyStep, setApplyStep] = useState<'initial' | 'hr-selection' | 'success'>('initial');
  const [copied, setCopied] = useState(false);
  const [locationCopied, setLocationCopied] = useState(false);

  // ✅ جلب الداتا من Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .in('status', ['Active', 'Hold'])
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching jobs:', error);
      } else {
        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          status: item.status,
          company: item.company,
          account: item.account,
          shifts: item.shifts,
          interview: item.interview,
          location: item.location,
          graduation: item.graduation,
          nationality: item.nationality,
          maxAge: item.max_age,
          language: item.language,
          languageRequirement: item.language_requirement,
          salary: item.salary,
          process: item.process,
          training: item.training,
          details: item.details,
          locationType: item.location_type,
          targetLanguage: item.target_language,
        }));
        setAllJobs(mapped);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    if (showResults) {
      const resultsElement = document.getElementById('results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPage]);

  const matchedJobs = useMemo(() => {
    return allJobs.map(job => {
      let score = 100;

      if (typeof profile.age === 'number' && job.maxAge && profile.age > job.maxAge) {
        score -= (profile.age - job.maxAge) * 10;
      }

      if (profile.location && profile.location !== 'any') {
        const proximity = locationProximity[profile.location] || [];
        if (!proximity.includes(profile.location)) {
          score -= 20;
        }
      }

      if (profile.english) {
        const userLevel = languageLevels[profile.english] || 0;
        const jobLevel = languageLevels[job.languageRequirement] || 2;
        if (userLevel < jobLevel) {
          score -= (jobLevel - userLevel) * 20;
        }
      }

      if (profile.nationality && job.nationality) {
        const jobNat = job.nationality.toLowerCase();
        const userNat = profile.nationality.toLowerCase();
        if (jobNat.includes('egyptians only') && userNat !== 'egyptian') {
          score -= 50;
        }
      }

      if (profile.preferredShift && job.shifts) {
        const jobShift = job.shifts.toLowerCase();
        const userShift = profile.preferredShift.toLowerCase();
        if (!jobShift.includes(userShift)) {
          score -= 15;
        }
      }

      return { ...job, matchScore: Math.max(0, Math.min(100, score)) };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [profile, allJobs]);

  const filteredJobs = useMemo(() => {
    setCurrentPage(1);
    if (filterStatus === 'all') return matchedJobs;
    return matchedJobs.filter(j => j.status === filterStatus);
  }, [matchedJobs, filterStatus]);

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const handleCopyLocation = () => {
    if (!selectedJob) return;
    navigator.clipboard.writeText(selectedJob.location);
    setLocationCopied(true);
    setTimeout(() => setLocationCopied(false), 2000);
  };

  const openInGoogleMaps = () => {
    if (!selectedJob) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.location)}`;
    window.open(url, '_blank');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormIncomplete) return;
    setIsSearching(true);
    setCurrentPage(1);
    setFilterStatus('Active');
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
      const resultsEl = document.getElementById('results');
      if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
  };

  const handleCopy = () => {
    if (!selectedJob) return;
    navigator.clipboard.writeText(selectedJob.details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToHr = (hrPhone: string) => {
    if (!selectedJob) return;

    const message = `Hi,
I want to apply in this offer - ${selectedJob.company} (${selectedJob.account}) - and this my Data:
🎓 Graduation: ${profile.status}
🌐 English Level: ${profile.english}
💼 Experience: ${profile.experience} ${profile.experienceType ? `(${profile.experienceType})` : ''}
📱 Mobile Number: ${profile.mobile}
👤 Name: ${profile.name}`;

    const whatsappUrl = `https://wa.me/${hrPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setApplyStep('success');
  };

  const resetModal = () => {
    setSelectedJob(null);
    setApplyStep('initial');
    setCopied(false);
  };

  return (
    <section id="jobs" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Job Board</h2>
            <p className="text-white/50">Personalize your profile to find the best career matches.</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-5 md:p-12 rounded-[2.5rem] md:rounded-[2rem] glass border-white/5 mb-16"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-brand/10 border border-brand/20">
                <UserCog className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-2xl font-bold italic">Your Profile Configuration</h3>
            </div>

            <form onSubmit={handleSearch} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1 flex items-center gap-2">
                  <UserCog className="w-3 h-3" /> Full Name
                </label>
                <input 
                  type="text" 
                  value={profile.name}
                  placeholder="Please enter your full name"
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-brand/50 focus:ring-1 focus:ring-brand/50 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1 flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Mobile Number
                </label>
                <input 
                  type="tel" 
                  value={profile.mobile}
                  placeholder="Please enter your mobile number"
                  onChange={e => setProfile({...profile, mobile: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-brand/50 focus:ring-1 focus:ring-brand/50 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Age
                </label>
                <input 
                  type="number" 
                  value={profile.age}
                  placeholder="Please enter the age"
                  onChange={e => {
                    const val = e.target.value === '' ? '' : parseInt(e.target.value);
                    setProfile({...profile, age: val});
                    if (val !== '' && val < 18) {
                      setAgeError('Must be at least 18 years old');
                    } else {
                      setAgeError(null);
                    }
                  }}
                  className={`w-full bg-white/5 border ${ageError ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 focus:border-brand/50 focus:ring-1 focus:ring-brand/50 outline-none transition-all font-medium`}
                />
                {ageError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-[10px] font-bold uppercase tracking-wider ml-1 mt-1"
                  >
                    {ageError}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1 flex items-center gap-2">
                  <GraduationCap className="w-3 h-3" /> Graduation
                </label>
                <select 
                  value={profile.status}
                  onChange={e => setProfile({...profile, status: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-brand/50 outline-none transition-all font-medium appearance-none [&>option]:bg-background [&>option]:text-white"
                >
                  <option value="" disabled>Select status...</option>
                  <option value="undergrad">Undergraduate</option>
                  <option value="grad">Graduate</option>
                  <option value="gap-year">Gap Year</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1 flex items-center gap-2">
                  <Globe className="w-3 h-3" /> English Level
                </label>
                <select 
                  value={profile.english}
                  onChange={e => setProfile({...profile, english: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-brand/50 outline-none transition-all font-medium appearance-none [&>option]:bg-background [&>option]:text-white"
                >
                  <option value="" disabled>Select level...</option>
                  {Object.keys(languageLevels).map(lv => (
                    <option key={lv} value={lv}>{lv}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Preferred Location
                </label>
                <select 
                  value={profile.location}
                  onChange={e => setProfile({...profile, location: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-brand/50 outline-none transition-all font-medium appearance-none [&>option]:bg-background [&>option]:text-white"
                >
                  <option value="" disabled>Select location...</option>
                  <option value="nasr-city">Nasr City</option>
                  <option value="sheikh-zayed">Sheikh Zayed</option>
                  <option value="abbassia">3bbasya (Abbassia)</option>
                  <option value="sheraton">Sheraton</option>
                  <option value="zahra2-maadi">Zahra2 elmaadi</option>
                  <option value="gisr-elsuez">Gisr elsuez</option>
                  <option value="maadi">Maadi</option>
                  <option value="wfh">WFH</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1 flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Nationality
                </label>
                <select 
                  value={profile.nationality}
                  onChange={e => setProfile({...profile, nationality: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-brand/50 outline-none transition-all font-medium appearance-none [&>option]:bg-background [&>option]:text-white"
                >
                  <option value="" disabled>Select nationality...</option>
                  <option value="egyptian">Egyptian</option>
                  <option value="sudanese">Sudanese</option>
                  <option value="foreigner">Foreigner</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1 flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> Experience
                </label>
                <select 
                  value={profile.experience}
                  onChange={e => setProfile({...profile, experience: e.target.value, experienceType: e.target.value === '' ? '' : profile.experienceType})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-brand/50 outline-none transition-all font-medium appearance-none [&>option]:bg-background [&>option]:text-white"
                >
                  <option value="" disabled>Select experience...</option>
                  <option value="0-3 months">0-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="1+ year">1+ Year</option>
                </select>
              </div>

              <AnimatePresence>
                {profile.experience && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1 flex items-center gap-2">
                      <Zap className="w-3 h-3" /> Experience Type
                    </label>
                    <select 
                      value={profile.experienceType}
                      onChange={e => setProfile({...profile, experienceType: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-brand/50 outline-none transition-all font-medium appearance-none [&>option]:bg-background [&>option]:text-white"
                    >
                      <option value="" disabled>Select category...</option>
                      <option value="customer-service">Customer service</option>
                      <option value="sales">Sales</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Preferred Shift
                </label>
                <select 
                  value={profile.preferredShift}
                  onChange={e => setProfile({...profile, preferredShift: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-brand/50 outline-none transition-all font-medium appearance-none [&>option]:bg-background [&>option]:text-white"
                >
                  <option value="" disabled>Select shift...</option>
                  <option value="night">Night Shifts</option>
                  <option value="morning">Morning Shifts</option>
                  <option value="rotational">Rotational Shifts</option>
                  <option value="fixed">Fixed Shifts</option>
                </select>
              </div>

              <div className="md:col-span-2 flex gap-4 mt-4">
                <button 
                  type="submit"
                  disabled={isSearching || isFormIncomplete || loading}
                  className="flex-1 bg-brand text-background font-black py-4 md:py-5 rounded-2xl flex items-center justify-center gap-3 hover:translate-y-[-4px] active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:hover:translate-y-0"
                >
                  {isSearching || loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                  {loading ? "LOADING OFFERS..." : isSearching ? "OPTIMIZING SEARCH..." : "SMART MATCHING"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowResults(false)}
                  className="px-6 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-white/60"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>

          <div id="results">
            <AnimatePresence>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-12">
                    <div className="flex items-center gap-4 group">
                      <div className="h-8 w-1 bg-brand rounded-full group-hover:h-10 transition-all duration-300" />
                      <div>
                        <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                          Available <span className="text-brand">Offers</span>
                        </h4>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mt-1">
                          {filteredJobs.length} active opportunities found
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-1 rounded-2xl glass border-white/5">
                      {(['all', 'Active', 'Hold'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setFilterStatus(s)}
                          className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-brand text-background' : 'hover:bg-white/5 text-white/40'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {paginatedJobs.map((job, idx) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.2) }}
                        className="group relative"
                      >
                        <div className={`absolute -top-1 -right-1 z-10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${job.status === 'Active' ? 'bg-brand text-background' : 'bg-amber-500 text-background'}`}>
                          {job.status}
                        </div>
                        <div className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] glass ${job.status === 'Hold' ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20' : 'border-white/5'} hover:border-brand/30 transition-all cursor-pointer h-full flex flex-col will-change-transform`} onClick={() => setSelectedJob(job)}>
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h5 className="text-xl md:text-2xl font-black italic tracking-tight glow-text mb-1">{job.company}</h5>
                              <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-none">{job.account}</p>
                            </div>
                            <div className={`text-2xl font-black italic ${job.status === 'Hold' ? 'text-amber-500' : job.matchScore === 0 ? 'text-red-500' : job.matchScore! > 80 ? 'text-brand' : 'text-white/40'}`}>
                              {job.matchScore}%
                            </div>
                          </div>

                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-6 relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${job.matchScore || 0}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className={`h-full relative z-10 ${job.status === 'Hold' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]' : job.matchScore === 0 ? 'bg-red-500' : 'bg-brand shadow-[0_0_8px_rgba(31,207,177,0.2)]'}`}
                            />
                            {job.matchScore === 0 && (
                              <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                            )}
                          </div>

                          <div className="space-y-3 mb-8 flex-grow">
                            <div className="flex items-center gap-3 text-sm text-white/60">
                              <MapPin className="w-4 h-4 text-brand" />
                              <span className="line-clamp-1">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/60">
                              <DollarSign className="w-4 h-4 text-brand" />
                              <span className="line-clamp-1">{job.salary}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/60">
                              <Globe className="w-4 h-4 text-brand" />
                              <span className="line-clamp-1">Language: {job.languageRequirement}</span>
                            </div>
                          </div>

                          <button className="uiverse-btn w-full">
                            ANALYZE POSITION
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-6 pb-12">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-3 md:p-4 rounded-2xl glass border-white/5 hover:bg-brand hover:text-background transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white"
                      >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
                      </button>
                      <div className="text-[10px] md:text-sm font-black tracking-widest text-white/40 uppercase">
                        Page <span className="text-white">{currentPage}</span> of {totalPages}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-3 md:p-4 rounded-2xl glass border-white/5 hover:bg-brand hover:text-background transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white"
                      >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
              onClick={() => setSelectedJob(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-surface border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-black overflow-hidden max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={resetModal}
                className="absolute top-4 right-4 md:top-8 md:right-8 p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 hover:bg-brand hover:text-background hover:border-brand transition-all z-20"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="p-4 md:p-12">
                <div className="mb-6 md:mb-12">
                  <div className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    {selectedJob.status} POSITION
                  </div>
                  <h2 className="text-2xl md:text-5xl font-black italic tracking-tighter mb-2 glow-text leading-tight">{selectedJob.company}</h2>
                  <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">{selectedJob.account}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8 mb-8 md:mb-12">
                  <div className="space-y-1">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand">Shifts</p>
                    <p className="font-medium text-sm md:text-base">{selectedJob.shifts}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand">Salary Range</p>
                    <p className="font-medium text-sm md:text-base">{selectedJob.salary}</p>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand">Location</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm md:text-base">{selectedJob.location}</p>
                      <div className="flex gap-1">
                        <button 
                          onClick={handleCopyLocation}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-brand hover:text-background hover:border-brand transition-all text-xs"
                        >
                          {locationCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          onClick={openInGoogleMaps}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-brand hover:text-background hover:border-brand transition-all text-xs"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 md:space-y-8">
                  <div className="p-4 md:p-8 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
                      <h4 className="text-base md:text-lg font-black italic flex items-center gap-3">
                        <Search className="w-4 h-4 md:w-5 md:h-5 text-brand" /> Detailed Description
                      </h4>
                      <button 
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-brand hover:text-background hover:border-brand transition-all text-[10px] md:text-xs font-bold uppercase w-full md:w-auto"
                      >
                        {copied ? <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Copy className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                        {copied ? "COPIED" : "COPY DETAILS"}
                      </button>
                    </div>
                    <div className="text-white/60 leading-relaxed text-[13px] md:text-sm whitespace-pre-wrap">
                      {selectedJob.details}
                    </div>
                  </div>

                  {applyStep === 'initial' ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 mb-4 flex justify-center"
                    >
                      <button 
                        onClick={() => setApplyStep('hr-selection')}
                        className="cta"
                      >
                        <span className="hover-underline-animation"> APPLY FOR THIS POSITION </span>
                        <svg
                          id="arrow-horizontal"
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="10"
                          viewBox="0 0 46 16"
                        >
                          <path
                            id="Path_10"
                            data-name="Path 10"
                            d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
                            transform="translate(30)"
                          ></path>
                        </svg>
                      </button>
                    </motion.div>
                  ) : applyStep === 'hr-selection' ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 md:mt-8 p-6 md:p-12 rounded-2xl md:rounded-[3.5rem] glass border-white/5 bg-gradient-to-br from-brand/5 via-transparent to-transparent flex flex-col items-center"
                    >
                      <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] mb-8 md:mb-12 text-white/20">
                        Choose Representative
                      </div>
                      <div className="w-full max-w-sm">
                        {HR_TEAM.map(hr => (
                          <button
                            key={hr.id}
                            onClick={() => handleApplyToHr(hr.phone)}
                            className="w-full p-6 md:p-10 rounded-xl md:rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-brand/40 hover:bg-brand/[0.03] transition-all flex items-center justify-between group relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-4 md:gap-7 relative z-10">
                              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-3xl bg-white/5 flex items-center justify-center text-[9px] md:text-[11px] font-black tracking-widest border border-white/10 group-hover:border-brand/30 group-hover:text-brand transition-all">
                                HR
                              </div>
                              <div className="text-left">
                                <span className="block font-black italic text-lg md:text-2xl tracking-tighter text-white group-hover:text-brand transition-colors">{hr.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-brand shadow-[0_0_10px_#1fcfb1]" />
                                  <span className="text-[7px] md:text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">Ready to assist</span>
                                </div>
                              </div>
                            </div>
                            <div className="relative z-10 w-9 h-9 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-brand group-hover:text-background group-hover:scale-110 transition-all shadow-xl">
                              <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                            </div>
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setApplyStep('initial')}
                        className="mt-8 text-[9px] md:text-[10px] font-black text-white/10 hover:text-white transition-colors uppercase tracking-[0.5em] border-b border-transparent hover:border-white/10 pb-1"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-8 p-8 md:p-12 rounded-2xl md:rounded-3xl glass border-brand/20 bg-brand/10 text-center"
                    >
                      <div className="w-12 h-12 md:w-20 md:h-20 bg-brand rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-[0_0_30px_rgba(31,207,177,0.4)]">
                        <Check className="w-6 h-6 md:w-10 md:h-10 text-background" />
                      </div>
                      <h4 className="text-xl md:text-2xl font-black italic mb-2 tracking-tight">APPLICATION SENT!</h4>
                      <p className="text-white/60 mb-6 md:mb-8 max-w-xs mx-auto text-[13px] md:text-sm">You have been redirected to WhatsApp to complete your application with the HR team.</p>
                      <button 
                        onClick={resetModal}
                        className="px-6 py-2.5 md:px-8 md:py-3 rounded-xl border border-brand/30 text-brand font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-brand hover:text-background transition-all"
                      >
                        Close Window
                      </button>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 md:p-6 rounded-xl md:rounded-2xl glass border-brand/20 flex items-center gap-4">
                      <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-brand shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-white/40">Requirements</p>
                        <p className="text-[13px] md:text-sm font-bold">{selectedJob.graduation}</p>
                      </div>
                    </div>
                    <div className="p-4 md:p-6 rounded-xl md:rounded-2xl glass border-brand/20 flex items-center gap-4">
                      <Languages className="w-6 h-6 md:w-8 md:h-8 text-brand shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-white/40">English Level</p>
                        <p className="text-[13px] md:text-sm font-bold">{selectedJob.languageRequirement}</p>
                      </div>
                    </div>
                    <div className="p-4 md:p-6 rounded-xl md:rounded-2xl glass border-brand/20 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
                      <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-brand shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-white/40">Interview Type</p>
                        <p className="text-[13px] md:text-sm font-bold">{selectedJob.interview}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}