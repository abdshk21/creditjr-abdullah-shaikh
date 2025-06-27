
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const FinBuddy = () => {
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState('');

  const tips = [
    "Small spend? Still track it! Every dirham counts.",
    "Saving for your dream? Let's build it one coin at a time.",
    "FinFact: The envelope method works best when you check it weekly!",
    "Missed a transaction? It's never too late to log it.",
    "Hey! Log your last spend to keep your score happy!",
    "Savings = Superpower. Even small amounts count!",
    "FinFact: The first paper money was used in China 1,000 years ago!",
    "Wanna build your credit score? Spend smart and track often!",
    "Money tip: Always pay yourself first — save before you spend!"
  ];

  const handleFinClick = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);
    setShowTip(true);
  };

  const closeTip = () => {
    setShowTip(false);
  };

  // Auto-close tip after 10 seconds
  useEffect(() => {
    if (showTip) {
      const timer = setTimeout(() => {
        setShowTip(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showTip]);

  return (
    <>
      {/* Fin Avatar */}
      <div 
        className="fixed bottom-20 left-4 z-40 cursor-pointer transform hover:scale-110 transition-transform duration-200"
        onClick={handleFinClick}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-[#102c54] to-[#1e3a72] rounded-full flex items-center justify-center shadow-lg border-4 border-[#d8a434] animate-bounce">
          <div className="text-2xl font-bold text-[#d8a434]">₡</div>
        </div>
        
        {/* Hover indicator */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#d8a434] rounded-full animate-pulse"></div>
      </div>

      {/* Tip Popup */}
      {showTip && (
        <div className="fixed bottom-40 left-4 z-50 max-w-xs animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl border-2 border-[#d8a434] p-4 relative">
            {/* Speech bubble arrow */}
            <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-r-2 border-b-2 border-[#d8a434] transform rotate-45"></div>
            
            {/* Close button */}
            <button
              onClick={closeTip}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
            
            {/* Tip content */}
            <div className="pr-6">
              <div className="text-sm font-semibold text-[#102c54] mb-1">Fin says:</div>
              <div className="text-sm text-gray-700">{currentTip}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FinBuddy;
