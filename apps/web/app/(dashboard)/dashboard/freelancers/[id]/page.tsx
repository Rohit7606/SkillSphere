import React from 'react';
import { db } from '../../../../../lib/db';
import { freelancers, users, reviews } from '../../../../../lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { BookMeetingModal } from '../../../../../components/bookings/book-meeting-modal';
import { UserCircle, MapPin, Star, Clock, Trophy } from 'lucide-react';

export default async function FreelancerProfilePage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const freelancerData = await db
    .select({
      id: freelancers.id,
      bio: freelancers.bio,
      skills: freelancers.skills,
      hourlyRate: freelancers.hourlyRate,
      location: freelancers.location,
      reputationScore: freelancers.reputationScore,
      email: users.email,
      name: users.name,
    })
    .from(freelancers)
    .innerJoin(users, eq(users.id, freelancers.userId))
    .where(eq(freelancers.id, id))
    .limit(1);

  if (freelancerData.length === 0) notFound();
  const freelancer = freelancerData[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="h-24 w-24 rounded-full bg-surface-hover border-2 border-border flex items-center justify-center shrink-0">
            <UserCircle className="h-12 w-12 text-text-secondary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {freelancer.name || (freelancer.email ? freelancer.email.split('@')[0] : `Freelancer ${freelancer.id.substring(0,6)}`)}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {freelancer.location || 'Remote'}</span>
              <span className="flex items-center gap-1 text-color-warning"><Star className="h-4 w-4 fill-current" /> {freelancer.reputationScore} Reputation</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> ₹{freelancer.hourlyRate}/hr</span>
            </div>
          </div>
          <div className="w-full md:w-auto shrink-0">
            <BookMeetingModal freelancerId={freelancer.id} freelancerName={freelancer.name || (freelancer.email ? freelancer.email.split('@')[0] : `Freelancer ${freelancer.id.substring(0,4)}`)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">About Me</h2>
            <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">
              {freelancer.bio || 'This freelancer hasn\'t written a bio yet.'}
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(freelancer.skills as string[])?.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-surface-hover border border-border rounded-full text-sm font-medium text-foreground">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent-primary" />
              Stats
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary">Reputation Score</p>
                <p className="text-2xl font-bold text-foreground">{freelancer.reputationScore}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Hourly Rate</p>
                <p className="text-xl font-bold text-foreground">₹{freelancer.hourlyRate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
