
import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fin's body component
const FinBody = ({ onClick, isClicked }: { onClick: () => void; isClicked: boolean }) => {
  const bodyRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (bodyRef.current) {
      // Idle bouncing animation
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0;
      
      // Rotation when clicked
      if (isClicked) {
        bodyRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 8) * 0.3;
      }
      
      // Subtle breathing
      bodyRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02);
    }
  });

  return (
    <group 
      ref={bodyRef}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Head */}
      <Sphere args={[0.3]} position={[0, 1.4, 0]}>
        <meshPhongMaterial color="#F4C2A1" />
      </Sphere>
      
      {/* Hair */}
      <Box args={[0.4, 0.2, 0.4]} position={[0, 1.6, 0]}>
        <meshPhongMaterial color="#4A2C17" />
      </Box>
      
      {/* Body (Navy hoodie) */}
      <Box args={[0.4, 0.6, 0.3]} position={[0, 0.7, 0]}>
        <meshPhongMaterial color="#1e3a8a" />
      </Box>
      
      {/* Credit symbol on hoodie */}
      <Text
        position={[0, 0.8, 0.16]}
        fontSize={0.15}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
      >
        ₡
      </Text>
      
      {/* Arms */}
      <Cylinder args={[0.06, 0.06, 0.4]} position={[-0.25, 0.7, 0]} rotation={[0, 0, Math.PI / 6]}>
        <meshPhongMaterial color="#1e3a8a" />
      </Cylinder>
      <Cylinder args={[0.06, 0.06, 0.4]} position={[0.25, 0.7, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <meshPhongMaterial color="#1e3a8a" />
      </Cylinder>
      
      {/* Hands */}
      <Sphere args={[0.08]} position={[-0.35, 0.5, 0]}>
        <meshPhongMaterial color="#F4C2A1" />
      </Sphere>
      <Sphere args={[0.08]} position={[0.35, 0.5, 0]}>
        <meshPhongMaterial color="#F4C2A1" />
      </Sphere>
      
      {/* Legs (Jeans) */}
      <Cylinder args={[0.08, 0.08, 0.5]} position={[-0.1, 0.1, 0]}>
        <meshPhongMaterial color="#4169E1" />
      </Cylinder>
      <Cylinder args={[0.08, 0.08, 0.5]} position={[0.1, 0.1, 0]}>
        <meshPhongMaterial color="#4169E1" />
      </Cylinder>
      
      {/* Shoes */}
      <Box args={[0.12, 0.08, 0.2]} position={[-0.1, -0.2, 0.05]}>
        <meshPhongMaterial color="white" />
      </Box>
      <Box args={[0.12, 0.08, 0.2]} position={[0.1, -0.2, 0.05]}>
        <meshPhongMaterial color="white" />
      </Box>
      
      {/* Backpack */}
      <Box args={[0.25, 0.3, 0.15]} position={[0, 0.7, -0.2]}>
        <meshPhongMaterial color="#8B4513" />
      </Box>
      
      {/* FinTips label on backpack */}
      <Text
        position={[0, 0.7, -0.12]}
        fontSize={0.06}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        FinTips
      </Text>
    </group>
  );
};

const FinCharacter = () => {
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const [isClicked, setIsClicked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();

  const tips = [
    { text: "Hey! Log your last spend to keep your score happy!", action: () => navigate('/add-transaction') },
    { text: "Savings = Superpower. Even small amounts count!", action: () => navigate('/set-goal') },
    { text: "FinFact: The first paper money was used in China 1,000 years ago!", action: null },
    { text: "Wanna build your credit score? Spend smart and track often!", action: () => navigate('/my-score') },
    { text: "Money tip: Always pay yourself first — save before you spend!", action: () => navigate('/recommendations') },
    { text: "Track your expenses daily to build good habits!", action: () => navigate('/transaction-history') },
    { text: "Emergency funds are your financial safety net!", action: () => navigate('/set-goal') },
    { text: "Small changes lead to big financial wins! 🎯", action: null }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsMinimized(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFinClick = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip.text);
    setShowTip(true);
    setIsClicked(true);
    
    // Reset click animation after 1 second
    setTimeout(() => setIsClicked(false), 1000);
  };

  const handleTipAction = () => {
    const tipData = tips.find(tip => tip.text === currentTip);
    if (tipData?.action) {
      tipData.action();
      setShowTip(false);
    }
  };

  if (isMobile && isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 rounded-full bg-[#102c54] hover:bg-[#1e3a72] text-white shadow-lg border-2 border-[#d8a434]"
        >
          <span className="text-2xl">👦</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* 3D Character */}
      <div className={`fixed ${isMobile ? 'bottom-4 left-4 w-32 h-40' : 'left-4 top-1/2 transform -translate-y-1/2 w-40 h-48'} z-40 pointer-events-auto`}>
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 1]} intensity={0.8} />
          <pointLight position={[-2, 2, 1]} intensity={0.5} />
          <FinBody onClick={handleFinClick} isClicked={isClicked} />
        </Canvas>
        
        {isMobile && (
          <Button
            onClick={() => setIsMinimized(true)}
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Speech Bubble */}
      {showTip && (
        <div className={`fixed ${isMobile ? 'bottom-48 left-4' : 'left-48 top-1/2 transform -translate-y-1/2'} z-50 max-w-sm`}>
          <Card className="shadow-lg border-2 border-[#d8a434] bg-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-[#102c54]">Fin says:</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTip(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-700 mb-3">{currentTip}</p>
              {tips.find(tip => tip.text === currentTip)?.action && (
                <Button
                  onClick={handleTipAction}
                  size="sm"
                  className="bg-[#d8a434] hover:bg-[#d8a434]/90 text-white"
                >
                  Take me there
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Speech bubble tail */}
          <div className={`absolute ${isMobile ? 'bottom-0 left-8' : 'left-0 top-8'} w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#d8a434] ${isMobile ? 'transform rotate-180' : 'transform -rotate-90'}`}></div>
        </div>
      )}
    </>
  );
};

export default FinCharacter;
