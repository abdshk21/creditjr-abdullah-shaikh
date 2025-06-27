
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ScoreExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: 'spendingControl' | 'savingsProgress' | 'loggingConsistency';
  score: number;
}

const ScoreExplanationModal = ({ isOpen, onClose, metric, score }: ScoreExplanationModalProps) => {
  const getPerformanceTier = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    if (score >= 30) return 'Below Average';
    return 'Poor';
  };

  const getExplanation = () => {
    const tier = getPerformanceTier(score);
    
    switch (metric) {
      case 'spendingControl':
        switch (tier) {
          case 'Excellent':
            return "🔥 You're crushing it on spending control – no cap! Staying consistent like this is leveling up your credit score hard. Keep doing what you're doing, and maybe even set a new goal just for fun!";
          case 'Good':
            return "✅ You're doing great on spending control – it's giving responsible spender vibes. A bit more effort and you'll be hitting excellence. Maybe review your recent logs or boost that savings one extra step.";
          case 'Average':
            return "😐 Not bad on spending control, but there's room to glow up. You're halfway there, so try checking in more regularly or making that extra budget cut. Your score is okay, but not thriving yet.";
          case 'Below Average':
            return "🧐 Hmm, spending control is lagging a bit. This is affecting your credit score noticeably. Let's fix it – maybe set reminders to log or break spending habits into smaller daily limits.";
          case 'Poor':
            return "🚨 Spending control needs some serious attention. It's one of the biggest reasons your score is low. Don't stress though – start small, like tracking 2–3 purchases a week. You got this!";
        }
        break;
      case 'savingsProgress':
        switch (tier) {
          case 'Excellent':
            return "💸 That's what we love to see – savings game on point! You're stacking that cash and it's boosting your score big time. Keep this streak and maybe treat yourself responsibly soon.";
          case 'Good':
            return "👌 You're saving smart! Just a bit more consistency and you'll be in beast mode. Try rounding up spare change or using small autosaves.";
          case 'Average':
            return "🤏 You're kind of saving... but also kind of not. You're in the middle zone. Maybe set a mini-goal like saving 10–15 د.إ per week to build that upward momentum.";
          case 'Below Average':
            return "😬 Savings are slipping. Try reviewing where your money's going. Even little changes like skipping that one extra snack run can start lifting your score.";
          case 'Poor':
            return "🆘 Yikes, savings are barely there. This pulls your score down hard. Time to lock in a small goal – like saving 5 د.إ a week. Start small, win big later.";
        }
        break;
      case 'loggingConsistency':
        switch (tier) {
          case 'Excellent':
            return "🧠 Daily log legend! You're tracking like a boss and your consistency is giving credit king/queen energy. This is one of the most underrated score boosters – keep it up!";
          case 'Good':
            return "📓 You're logging regularly and it shows! A few missed days here and there, but overall, you're solid. Try setting a weekly streak goal to stay sharp.";
          case 'Average':
            return "📉 Kinda logging, kinda ghosting. Your score's wobbling from it. Try logging right after each spend – make it a habit, not a hassle.";
          case 'Below Average':
            return "🕳️ Logging's too spotty to help your score. It's like driving blind. Set a daily 7pm reminder or log while brushing your teeth – anything to bring that score back up.";
          case 'Poor':
            return "🚫 Logging what? Your app probably thinks you're on vacation. Start with just logging your biggest purchase each day – even one entry helps the score recover.";
        }
        break;
    }
    
    // Fallback message if no specific explanation is found
    return `Your ${getMetricTitle().toLowerCase()} performance is at ${score}%. Keep working on improving this area to boost your overall credit score!`;
  };

  const getMetricTitle = () => {
    switch (metric) {
      case 'spendingControl':
        return 'Spending Control';
      case 'savingsProgress':
        return 'Savings Progress';
      case 'loggingConsistency':
        return 'Logging Consistency';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#102c54]">
            {getMetricTitle()} - {getPerformanceTier(score)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-lg font-semibold">
            Your Score: {score}%
          </div>
          <div className="text-gray-700 leading-relaxed">
            {getExplanation()}
          </div>
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#d8a434] to-[#f4c430] hover:from-[#e6b345] hover:to-[#f8d147] text-white"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreExplanationModal;
