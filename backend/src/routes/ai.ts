import { Router, Response } from 'express';
import { db } from '../database/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// AI COACH CONVERSATION & ANALYSIS ENDPOINT
router.post('/coach', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { message, contextType } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message required' });
    return;
  }

  const activeArc = db.getActiveArc(userId);
  const habits = activeArc ? db.getHabits(activeArc.id) : [];
  const completions = activeArc ? db.getCompletionsForArc(activeArc.id) : [];
  const user = req.user!;

  // Recent 7 days completion rate
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  const recentCompletions = completions.filter(c => c.date >= sevenDaysAgoStr);

  const habitStats = habits.map(h => {
    const doneCount = recentCompletions.filter(c => c.habitId === h.id).length;
    return {
      name: h.name,
      category: h.category,
      doneCount,
      rate: Math.round((doneCount / 7) * 100)
    };
  });

  const lowestHabit = [...habitStats].sort((a, b) => a.doneCount - b.doneCount)[0];
  const highestHabit = [...habitStats].sort((a, b) => b.doneCount - a.doneCount)[0];

  // Check for external LLM key if provided in env
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey && process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are ARC AI, a benevolent, elite personal coach inside the Winter Arc application.
Your core philosophy is "Consistency over perfection. Your season, your rules, your transformation."
NEVER guilt-trip the user. When habits are missed, suggest reducing friction, lowering the bar, or changing time slots.
User stats: Level ${user.level}, Streak ${user.currentStreak} days, Active habits: ${habits.map(h => h.name).join(', ')}.
Lowest habit recently: ${lowestHabit?.name || 'None'} (${lowestHabit?.doneCount || 0}/7 days).
Highest habit: ${highestHabit?.name || 'None'} (${highestHabit?.doneCount || 0}/7 days).
Answer warmly, clearly, concisely, and with grounded stoic empathy.`
            },
            { role: 'user', content: message }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          res.json({ reply, generatedBy: 'llm' });
          return;
        }
      }
    } catch (e) {
      console.warn('LLM API error, falling back to built-in empathetic coaching engine', e);
    }
  }

  // Built-in intelligent benevolent coaching engine
  const lowerMsg = message.toLowerCase();
  let reply = '';

  if (lowerMsg.includes('miss') || lowerMsg.includes('fail') || lowerMsg.includes('hard') || lowerMsg.includes('struggl') || lowerMsg.includes('workout') || lowerMsg.includes('tired')) {
    const targetHabit = habits.find(h => lowerMsg.includes(h.name.toLowerCase())) || lowestHabit;
    if (targetHabit) {
      const count = lowestHabit?.doneCount || 2;
      reply = `I see you're finding ${targetHabit.name} challenging right now. In the last 7 days, you still completed it ${count} times — and that effort matters.\n\nRemember: Consistency always beats perfection. Instead of pushing for an intense session, try the 2-minute rule tomorrow: just show up for 5 minutes, or shift it to a time when your friction is lowest. How does that feel?`;
    } else {
      reply = `Never look at a missed day as a defeat. In the Winter Arc, you are forging a mindset of resilience, not a robotic streak.\n\nWhat matters is that you're right here now, reflecting. Pick one tiny win for tomorrow and let the momentum rebuild naturally.`;
    }
  } else if (lowerMsg.includes('routine') || lowerMsg.includes('morning') || lowerMsg.includes('evening') || lowerMsg.includes('schedule')) {
    reply = `Here is a high-impact, low-friction Winter Arc daily rhythm tailored for you:\n\n🌅 **Morning Anchor**:\n• Hydrate (500ml water)\n• 10 min movement or walk in natural light\n• Clear your top priority task\n\n⚡ **Afternoon Focus**:\n• 20-30 min deep focus or study block\n\n🌙 **Evening Reset**:\n• 15 min reading without phone screens\n• Complete your Daily Check-in & reflect\n• Wind down before 11 PM\n\nWhich of these would you like to incorporate first?`;
  } else if (lowerMsg.includes('plan') || lowerMsg.includes('week') || lowerMsg.includes('goal')) {
    reply = `For your upcoming week in your Winter Arc, let's keep the focus sharp:\n\n1. **Protect your cornerstone**: Focus heavily on ${highestHabit?.name || 'your core daily habit'}, as it builds your baseline momentum.\n2. **Tweak the friction**: For ${lowestHabit?.name || 'your challenging habit'}, drop the barrier to entry.\n3. **Weekly Goal**: Complete your evening check-in at least 5 days this week.\n\nYou have ${user.currentStreak} days of momentum backing you. Let's make this week count.`;
  } else if (lowerMsg.includes('motivat') || lowerMsg.includes('lazy') || lowerMsg.includes('feel like')) {
    reply = `You don't need motivation — you need consistency. Motivation is fleeting, but identity is enduring.\n\nEvery time you do a habit when you don't feel like it, you cast a vote for the person you are becoming in this Arc. Even 20% of your usual effort today is 100% better than zero.`;
  } else {
    reply = `You are on Day ${Math.min(activeArc?.durationDays || 90, 17)} of your Winter Arc with a ${user.currentStreak}-day streak and Level ${user.level} (${user.xp} XP).\n\nYour transformation is happening in the quiet moments that nobody else sees. What specific aspect of your habits or routine would you like us to optimize together today?`;
  }

  res.json({
    reply,
    generatedBy: 'arc-ai-core',
    context: {
      streak: user.currentStreak,
      habitStats
    }
  });
});

export default router;
