
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
    if (score >= 50) return 'Moderate';
    if (score >= 30) return 'Low';
    return 'Poor';
  };

  const getExplanation = () => {
    const tier = getPerformanceTier(score);
    
    switch (metric) {
      case 'spendingControl':
        switch (tier) {
          case 'Excellent':
            return "You crushed it this month! Your spending stayed totally in check — barely touched your budget. That gave a huge boost to your score since this makes up 40% of it. Keep flexing that money discipline! 🧠💸";
          case 'Good':
            return "You're doing solid with your spending! Most of the time you stay under budget, which is keeping your score looking good. Since spending control is 40% of your score, you're already winning. Maybe just watch those weekend splurges? 🛍️";
          case 'Moderate':
            return "Your spending is pretty balanced, but there's room to level up! You're hitting your budget most months but going over sometimes. Since this is 40% of your score, tightening up here could really boost your numbers. 📊";
          case 'Low':
            return "You might've gone a bit overboard — it's okay, we've all been there. Try tracking small purchases too. Spending made up 40% of your score, so even small changes can level you up fast. 🍕🛍️";
          case 'Poor':
            return "No judgment, but your spending needs some TLC. You've been going way over budget, which is dragging down your score big time (40% of it!). Start with small wins — maybe set weekly spending limits? 💪";
        }
        break;
      case 'savingsProgress':
        switch (tier) {
          case 'Excellent':
            return "You're a savings legend! Hitting your savings goals consistently is giving your score major points. This category is 30% of your total, so you're basically securing the bag. Keep stacking! 💰🔥";
          case 'Good':
            return "Your savings game is pretty strong! You're hitting most of your goals, which is boosting your score nicely. Since this is 30% of your total score, you're on the right track. Maybe aim for that extra 5-10%? 🎯";
          case 'Moderate':
            return "Your savings are decent but could use some love. You're saving sometimes but not consistently hitting your goals. Since this is 30% of your score, getting more consistent here could really move the needle. 📈";
          case 'Low':
            return "Your savings need some attention! You're not hitting your goals regularly, which is impacting 30% of your score. Start small — even saving $20 a week adds up and will boost your score. 🌱";
          case 'Poor':
            return "Time to get serious about saving! You're barely hitting any savings goals, which is really hurting your score (30% of it). Start with the 50/30/20 rule — even small progress counts! 🚀";
        }
        break;
      case 'loggingConsistency':
        switch (tier) {
          case 'Excellent':
            return "You're logging like a pro! Your consistency is on point, tracking almost every day. This dedication is paying off big time in your score. Keep that daily habit going — it's clearly working! 📱✨";
          case 'Good':
            return "Your logging game is solid! You're tracking most days, which is keeping your consistency score healthy. Since this is 30% of your total, you're doing great. Maybe try to hit that daily streak? 📊";
          case 'Moderate':
            return "You're logging pretty regularly but could use more consistency. You're tracking maybe half the time, which is okay but not optimal. Since this is 30% of your score, daily logging could really boost your numbers. 📝";
          case 'Low':
            return "You're logging like once a week, which is chill... but let's aim for a daily streak. Your consistency score needs that TLC since it's 30% of your total. Even quick daily check-ins help! ⏰";
          case 'Poor':
            return "Your logging is pretty random right now, which is dragging down 30% of your score. No stress though — start with just 5 minutes a day to track your spending. Consistency beats perfection! 🎯";
        }
        break;
    }
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
