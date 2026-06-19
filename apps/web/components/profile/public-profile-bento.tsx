"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle, MapPin, Star, Clock, Trophy, Mail, CheckCircle2, Briefcase, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';
import { BookMeetingModal } from '../bookings/book-meeting-modal';

export function PublicProfileBento({ freelancer, reviews }: { freelancer: any, reviews: any[] }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const portfolioItems = freelancer.portfolio || [];
  const skills = (freelancer.skills as string[]) || [];
  const hasReviews = reviews && reviews.length > 0;
  const hasPortfolio = portfolioItems.length > 0;
  const avgRating = hasReviews ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  // Provide a minimum reputation score for new/uncalculated profiles so it doesn't look broken (0)
  const displayReputation = freelancer.reputationScore > 0 ? freelancer.reputationScore : 1;

  return (
    <div className="w-full relative">
      <motion.div
        className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Premium Hero Banner */}
        <motion.div variants={itemVariants} className="relative rounded-2xl bg-white border border-border shadow-sm mb-6 mt-2">
          {/* Solid Cover Color */}
          <div className="w-full h-28 bg-accent-primary rounded-t-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-black/5"></div>
          </div>
          
          <div className="relative px-6 md:px-8 pb-5">
            <div className="flex flex-col md:flex-row gap-5">
              {/* Avatar Profile (Overlapping) */}
              <div className="-mt-10 h-24 w-24 rounded-2xl bg-white p-1.5 shadow-md shrink-0 relative z-10 border border-slate-100 mx-auto md:mx-0">
                {freelancer.avatarUrl ? (
                  <img src={freelancer.avatarUrl} alt={freelancer.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center">
                    <UserCircle className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                {/* Premium Tick Mark */}
                <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 rounded-full p-0.5 border-2 border-white shadow-sm flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left pt-2 md:pt-3 z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {freelancer.name || (freelancer.email ? freelancer.email.split('@')[0] : `Freelancer ${freelancer.id.substring(0,6)}`)}
                  </h1>
                  <span className="inline-flex px-2.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] uppercase tracking-bold font-bold rounded-full shadow-sm mx-auto md:mx-0 items-center justify-center">
                    <Star className="h-2.5 w-2.5 mr-1 fill-amber-500 text-amber-500" /> Top Rated
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-600 mt-2 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-accent-primary" /> {freelancer.location || 'Remote'}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-accent-primary" /> ₹{freelancer.hourlyRate}/hr</span>
                  <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Available Now</span>
                </div>
              </div>
              
              {/* Properly aligned button */}
              <div className="w-full md:w-auto shrink-0 flex justify-center md:justify-end ml-auto z-10 pt-2 md:pt-4">
                <BookMeetingModal freelancerId={freelancer.id} freelancerName={freelancer.name || 'Freelancer'} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Bento Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* Left Sidebar: About + Stats + Expertise + Reviews */}
          <div className="xl:col-span-4 flex flex-col gap-5">

            {/* Stats Combined into One Card */}
            <motion.div variants={itemVariants} className="bg-white border border-border rounded-2xl p-6 flex items-center justify-around shadow-sm">
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-slate-800">{displayReputation}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 flex items-center gap-1"><Activity className="h-3 w-3" /> Reputation</span>
              </div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-slate-800 flex items-center gap-1">
                  {avgRating} <Star className="h-5 w-5 fill-amber-400 text-amber-400 -mt-1" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Avg Rating</span>
              </div>
            </motion.div>

            {/* About Me */}
            <motion.div variants={itemVariants} className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-[#5B4AE4]" /> About Me
              </h2>
              <p className="text-slate-700 leading-relaxed text-sm">
                {freelancer.bio || 'This freelancer hasn\'t written a bio yet.'}
              </p>
            </motion.div>

            {/* Expertise */}
            <motion.div variants={itemVariants} className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#5B4AE4]" /> Technical Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">No skills listed</span>
                )}
              </div>
            </motion.div>

            {/* Client Reviews */}
            <motion.div variants={itemVariants} className="bg-white border border-border rounded-2xl p-6 shadow-sm flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#5B4AE4]" /> Client Reviews
                </h2>
                {hasReviews && (
                  <span className="text-[10px] font-semibold text-[#5B4AE4] bg-[#5B4AE4]/10 px-2 py-0.5 rounded-full">{reviews.length} total</span>
                )}
              </div>

              {hasReviews ? (
                <div className="space-y-4 flex-1">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="shrink-0 h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
                          {review.reviewerAvatar ? (
                            <img src={review.reviewerAvatar} alt="Reviewer" className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle className="w-full h-full text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{review.reviewerName || 'Client'}</p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-2.5 w-2.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-400 text-sm">
                  <Star className="h-8 w-8 mb-2 opacity-20" />
                  No reviews yet.
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Portfolio */}
          <motion.div variants={itemVariants} className="xl:col-span-8 bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#5B4AE4]" /> Featured Work
              </h2>
              {hasPortfolio && (
                <button className="text-xs font-semibold text-[#5B4AE4] hover:text-[#4A3BCE] flex items-center gap-1 transition-colors">
                  View All Projects <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {hasPortfolio ? (
              <div className={`grid gap-5 flex-1 ${portfolioItems.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {portfolioItems.slice(0, 6).map((item: any, idx: number) => (
                  <motion.div
                    key={item.id || idx}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={`relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm bg-slate-900 border border-border ${portfolioItems.length === 1 ? 'min-h-[400px]' :
                      (idx === 0 && portfolioItems.length >= 3 ? 'md:col-span-2 md:aspect-[21/9]' : 'aspect-video')
                      }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 group-hover:from-black/80 transition-opacity duration-300" />

                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-xl md:text-2xl tracking-tight drop-shadow-md">{item.title}</h3>
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <ArrowUpRight className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      {item.tech && (
                        <div className="mt-3 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {item.tech.split(',').slice(0, 4).map((t: string) => (
                            <span key={t.trim()} className="px-3 py-1 text-[11px] font-bold text-white/90 bg-white/10 border border-white/20 rounded uppercase tracking-wider backdrop-blur-sm">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex-1 min-h-[400px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                <Briefcase className="h-10 w-10 mb-3 opacity-30 text-[#5B4AE4]" />
                <p className="text-sm font-medium">No portfolio items uploaded yet</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}


