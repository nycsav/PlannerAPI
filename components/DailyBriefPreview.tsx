import { useEffect, useState } from 'react';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { format } from 'date-fns';

interface DailyBrief {
  content: {
    linkedin_post: string;
    briefing_items: string;
    citations: Array<{
      title: string;
      url: string;
      snippet: string;
    }>;
  };
  approved_by: string;
  approved_at: string;
  created_at: any;
}

export const DailyBriefPreview: React.FC = () => {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [briefDate, setBriefDate] = useState<string>('');

  useEffect(() => {
    fetchDailyBrief();
  }, []);

  const fetchDailyBrief = async () => {
    try {
      // Try today's brief first
      const today = format(new Date(), 'yyyy-MM-dd');
      let briefDoc = await getDoc(doc(db, 'daily_briefs', today));

      if (!briefDoc.exists()) {
        // Fallback to yesterday
        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        briefDoc = await getDoc(doc(db, 'daily_briefs', yesterday));

        if (briefDoc.exists()) {
          setBriefDate(yesterday);
        }
      } else {
        setBriefDate(today);
      }

      if (briefDoc.exists()) {
        setBrief(briefDoc.data() as DailyBrief);
      }
    } catch (error) {
      console.error('Error fetching daily brief:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="bg-gray-100 dark:bg-slate-800/50 rounded-xl p-8 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="bg-gray-100 dark:bg-slate-800/50 rounded-xl p-8 text-center border border-gray-200 dark:border-slate-700">
          <p className="text-gray-600 dark:text-gray-400">
            Today's intelligence brief is being prepared. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  // Extract first 2-3 sentences from LinkedIn post as preview
  const getPreview = (text: string) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 2).join(' ');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-12">
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-8 border-2 border-bureau-signal/20 dark:border-planner-orange/20 hover:border-bureau-signal/40 dark:hover:border-planner-orange/40 transition-all shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 font-display italic">
              Today's Intelligence Brief
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {format(new Date(briefDate), 'MMMM d, yyyy')}
              {briefDate !== format(new Date(), 'yyyy-MM-dd') && (
                <span className="ml-2 text-planner-orange">(Yesterday's brief)</span>
              )}
            </p>
          </div>
          <div className="bg-planner-orange/10 px-3 py-1 rounded-full">
            <span className="text-planner-orange text-sm font-bold">NEW</span>
          </div>
        </div>

        {/* Preview Content */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {getPreview(brief.content.linkedin_post)}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            // Open modal with full brief content
            const event = new CustomEvent('openBriefModal', {
              detail: {
                brief: {
                  title: `Intelligence Brief - ${format(new Date(briefDate), 'MMM d, yyyy')}`,
                  summary: brief.content.linkedin_post,
                  sources: brief.content.citations,
                  briefingItems: brief.content.briefing_items,
                }
              }
            });
            window.dispatchEvent(event);
          }}
          className="w-full sm:w-auto px-6 py-3 bg-planner-orange hover:bg-planner-orange/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          Read Full Brief
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Sources count */}
        {brief.content.citations && brief.content.citations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyzed {brief.content.citations.length}+ sources from Perplexity AI
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
