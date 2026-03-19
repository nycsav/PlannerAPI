# Signal2Noise — GTM Launch Plan

**Date**: 2026-03-19
**Target Launch**: TBD (after Phase 1 complete)
**Live URL**: signals.ensolabs.ai

---

## Pre-Launch Checklist

### Landing Page (signals.ensolabs.ai)
- [ ] Hero section: headline + search bar demo + CTA
- [ ] Social proof: "Powered by 50+ sources" badge
- [ ] 3-feature showcase with visuals (Signal Feed, AI Search, Source Intelligence)
- [ ] Email capture for early access / waitlist
- [ ] Footer: links to Twitter, LinkedIn, GitHub, Discord
- [ ] OG tags + social preview images configured
- [ ] Favicon set installed
- [ ] Mobile responsive

### Email Capture Tools (Pick One)
| Tool | Cost | Best For |
|---|---|---|
| Loops | Free up to 1K contacts | Simple, clean, developer-friendly |
| Resend + React Email | Free up to 3K/month | Custom templates, React integration |
| Beehiiv | Free up to 2.5K subs | Newsletter + growth tools |
| **Recommendation**: Loops for waitlist, Resend for transactional |

### Brand Assets Ready
- [ ] Logo (SVG, PNG all sizes)
- [ ] Favicon set installed
- [ ] OG image (1200x630)
- [ ] Social banners (Twitter 1500x500, LinkedIn 1128x191)
- [ ] GitHub social preview (1280x640)
- [ ] Product Hunt assets (logo 240x240, gallery 1270x760 x 5-8)
- [ ] Demo video / GIF (60-90 seconds)

---

## Launch Platform Strategy

### Product Hunt (Primary Launch)

**Optimal Timing**: Tuesday or Wednesday, 12:01 AM PT (when the day resets)

**Pre-Launch (1-2 weeks before)**:
- [ ] Create upcoming page on Product Hunt
- [ ] Invite 20-30 people to follow the upcoming page
- [ ] Line up a Hunter (ideally someone with 1K+ followers on PH)
- [ ] Prepare first comment (founder story, 200-300 words)
- [ ] Prep 5-8 gallery images showing the product
- [ ] Record demo GIF/video

**Launch Day Checklist**:
- [ ] Post goes live at 12:01 AM PT
- [ ] First comment immediately after (founder story + ask)
- [ ] Share on Twitter, LinkedIn, Discord within first hour
- [ ] DM 50 supporters asking them to check it out (don't say "upvote")
- [ ] Respond to every comment within 30 minutes
- [ ] Post mid-day update (6-8 hours in)
- [ ] Share real-time stats/reactions on Twitter

**First Comment Template**:
> Hey Product Hunt! I'm [Name], builder of Signal2Noise.
>
> I was spending 2+ hours daily reading newsletters, analyst reports, and news just to stay on top of competitive moves in AI. I built S2N to do that automatically.
>
> Signal2Noise uses AI to scan 10,000+ sources, score signals by relevance, and surface what actually matters — with visuals built into every card.
>
> What makes it different:
> - Every signal gets an AI-generated visual (powered by Gemini)
> - Signal scoring from 0-100 with momentum tracking
> - Source transparency — see exactly where intelligence came from
>
> Would love your feedback. What signals would you track?

### Hacker News (Show HN)

**Title Format**: `Show HN: Signal2Noise – AI competitive intelligence from 10K+ sources`

**Best Time**: Tuesday-Thursday, 8-10 AM ET

**Post Body** (keep short, HN values brevity):
> Signal2Noise is an AI-powered competitive intelligence feed. It scans 10,000+ sources, scores signals by relevance (0-100), and generates visual summaries.
>
> Built with: React, Firebase, Gemini 3.1 Pro (grounded search), Nano Banana 2 (image gen)
>
> Live at: signals.ensolabs.ai
>
> I built this because tools like Crayon ($20-40K/yr) are overkill for indie teams. S2N runs on ~$95/month.

**HN Tips**:
- Don't ask for upvotes (bannable)
- Respond to every comment, especially criticism
- Share technical details freely — HN loves architecture posts
- Post a follow-up "lessons learned" post 1-2 weeks later

### Twitter/X Launch Thread

**Thread Structure (7-8 tweets)**:
1. Hook: "I replaced $40K/yr competitive intelligence with a $95/month AI app. Here's what I built:"
2. Problem: "I was spending 2+ hours daily reading analyst reports..."
3. Solution: Screenshot of the feed with cards
4. Tech: "Powered by Gemini 3.1 Pro for search + Nano Banana 2 for visuals"
5. Demo: GIF or video of searching and expanding a signal card
6. Before/after: Cost comparison table
7. CTA: "Try it free at signals.ensolabs.ai"
8. Ask: "What competitive signal do you wish you could track? Reply and I'll add it."

### LinkedIn Launch Post

**Format**: Story-driven, 1300-1500 characters

**Key Elements**:
- Personal story hook (why you built it)
- 3 bullet points on what it does
- Cost comparison to enterprise tools
- Screenshot or video
- CTA to try it
- Tag relevant people / companies

### Reddit

**Subreddits**:
- r/SaaS (Show & Tell flair)
- r/startups (Share Your Startup thread)
- r/artificial (if AI-focused angle)
- r/EntrepreneurRideAlong
- r/indiehackers

**Rules**: Be authentic, share the journey, don't be salesy. Reddit hates marketing.

---

## Launch Day Timeline

| Time (PT) | Action |
|---|---|
| 12:01 AM | Product Hunt goes live |
| 12:05 AM | First comment posted |
| 6:00 AM | Twitter launch thread |
| 7:00 AM | LinkedIn post |
| 8:00 AM | Show HN post |
| 9:00 AM | Reddit posts (r/SaaS, r/startups) |
| 10:00 AM | Email blast to waitlist |
| 12:00 PM | Mid-day PH update comment |
| 3:00 PM | Share real-time metrics on Twitter |
| 6:00 PM | Thank you post on Twitter |
| 11:59 PM | PH day ends — share final ranking |

---

## Post-Launch: First 30 Days

### Week 1: Momentum
- [ ] Write a "Building Signal2Noise" blog post (technical architecture)
- [ ] Share daily on Twitter (metrics, user feedback, learnings)
- [ ] Respond to all PH/HN/Reddit comments
- [ ] Send follow-up email to waitlist with launch results

### Week 2: Content
- [ ] Publish "How I replaced $40K CI tools" article on LinkedIn
- [ ] Create YouTube demo walkthrough (5-10 min)
- [ ] Start Discord community (or decide on Slack)
- [ ] Reach out to 5-10 relevant newsletters for features

### Week 3: Iteration
- [ ] Ship top 3 user-requested features
- [ ] Share update post on Twitter/LinkedIn
- [ ] Publish first "Weekly Signal Digest" (content marketing)

### Week 4: Scale
- [ ] Analyze acquisition channels (which drove most signups)
- [ ] Double down on top 2 channels
- [ ] Plan pricing page / monetization if applicable
- [ ] Set up basic analytics (PostHog, Plausible, or Vercel Analytics)

---

## Metrics to Track

| Metric | Tool | Target (Month 1) |
|---|---|---|
| Unique visitors | Plausible/PostHog | 5,000+ |
| Signups / waitlist | Firebase Auth | 500+ |
| Product Hunt upvotes | PH dashboard | 200+ |
| Twitter followers | Twitter | 500+ |
| Daily active users | PostHog | 50+ |
| Avg session duration | PostHog | 3+ min |

---

## Lessons from Great AI Product Launches

### Perplexity
- Launched with zero marketing budget, grew via word of mouth
- Key: product was so good people shared it naturally
- Lesson: Make the core experience share-worthy

### Cursor
- Strong developer community before launch
- GitHub presence + open-source components built trust
- Lesson: Build in public, share technical details

### v0 (Vercel)
- Invite-only created scarcity and demand
- Shared generated code snippets went viral on Twitter
- Lesson: Make output shareable — screenshots of signal cards could go viral

### Linear
- Premium brand from day one (design, copy, everything)
- Changelog as marketing content
- Lesson: Brand quality signals product quality
