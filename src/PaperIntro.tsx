import { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Activity, 
  Brain, 
  Clock, 
  CheckCircle, 
  FileText, 
  Stethoscope, 
  ArrowRight, 
  ShieldCheck,
  BarChart3,
  Users,
  Menu,
  X
} from 'lucide-react';

const PaperPresentation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const layers = [
      { x: 0.08, nodes: [0.15, 0.30, 0.45, 0.60, 0.75] }, // Input
      { x: 0.28, nodes: [0.20, 0.35, 0.50, 0.65, 0.80] }, // Hidden 1
      { x: 0.48, nodes: [0.22, 0.38, 0.54, 0.70] },       // Hidden 2
      { x: 0.68, nodes: [0.25, 0.42, 0.58, 0.75] },       // Hidden 3
      { x: 0.88, nodes: [0.35, 0.50, 0.65] }              // Output
    ];

    class Particle {
      x: number;
      y: number;
      layerIndex: number;
      targetLayerIndex: number;
      targetX: number;
      targetY: number;
      speed: number;
      color: string;
      size: number;
      history: { x: number, y: number }[];

      constructor() {
        this.x = 0;
        this.y = 0;
        this.layerIndex = 0;
        this.targetLayerIndex = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.speed = 0;
        this.color = '';
        this.size = 0;
        this.history = [];
        this.reset();
      }

      reset() {
        // Start at random input node
        this.layerIndex = 0;
        const startNodeY = layers[0].nodes[Math.floor(Math.random() * layers[0].nodes.length)];
        this.x = width * layers[0].x;
        this.y = height * startNodeY;
        
        this.setNextTarget();
        
        this.speed = 0.5 + Math.random() * 0.8; // 更慢的速度
        const colors = ['#60a5fa', '#2dd4bf', '#a78bfa', '#38bdf8'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = 2 + Math.random() * 2;
        this.history = []; // Clear history on reset
      }

      setNextTarget() {
        this.targetLayerIndex = this.layerIndex + 1;
        
        if (this.targetLayerIndex >= layers.length) {
          this.reset();
          return;
        }

        const nextLayer = layers[this.targetLayerIndex];
        const randomNodeY = nextLayer.nodes[Math.floor(Math.random() * nextLayer.nodes.length)];
        
        this.targetX = width * nextLayer.x;
        this.targetY = height * randomNodeY;
      }

      update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          this.layerIndex = this.targetLayerIndex;
          this.x = this.targetX;
          this.y = this.targetY;
          this.setNextTarget();
        } else {
          this.x += (dx / dist) * this.speed;
          this.y += (dy / dist) * this.speed;
        }

        // Add to history for trail
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 20) {
          this.history.shift();
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw trail
        if (this.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(this.history[0].x, this.history[0].y);
          for (let i = 1; i < this.history.length; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
          }
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.size / 2;
          ctx.globalAlpha = 0.08;
          ctx.stroke();
        }

        // Draw particle head
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        
        // Glow
        ctx.shadowBlur = 0;
        ctx.shadowColor = this.color;
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      const p = new Particle();
      // Randomize initial progress through layers to avoid bunching
      if (Math.random() > 0.1) {
          const lIndex = Math.floor(Math.random() * (layers.length - 1));
          p.layerIndex = lIndex;
          const layer = layers[lIndex];
          p.x = width * layer.x;
          p.y = height * layer.nodes[Math.floor(Math.random() * layer.nodes.length)];
          p.setNextTarget();
          
          // Move it a bit along the path
          const progress = Math.random();
          p.x += (p.targetX - p.x) * progress;
          p.y += (p.targetY - p.y) * progress;
      }
      particles.push(p);
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      ctx.shadowBlur = 0; // Reset

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const sections = [
    { id: 'problem', title: '問題與挑戰' },
    { id: 'solution', title: 'AI 解決方案' },
    { id: 'results', title: '研究成果' },
    { id: 'impact', title: '臨床意義' }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  // Handle mouse move for node interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };
    
    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
      return () => hero.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Calculate node offset based on mouse position
  const getNodeOffset = (nodeX: number, nodeY: number) => {
    const dx = mousePos.x - nodeX;
    const dy = mousePos.y - nodeY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 25;
    const maxOffset = 12;
    
    if (distance < maxDistance) {
      const force = (maxDistance - distance) / maxDistance;
      return {
        x: -dx * force * maxOffset * 0.15,
        y: -dy * force * maxOffset * 0.15
      };
    }
    return { x: 0, y: 0 };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>
      {/* Import Noto Sans TC font */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap');
          
          @keyframes nodeGlow {
            0%, 100% { 
              filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.6));
              opacity: 0.8;
            }
            50% { 
              filter: drop-shadow(0 0 12px rgba(59, 130, 246, 1));
              opacity: 1;
            }
          }
          
          @keyframes flowPulse1 {
            0% { stroke-dashoffset: 200; opacity: 0; }
            10% { opacity: 0.9; }
            50% { opacity: 1; }
            90% { opacity: 0.9; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          
          @keyframes flowPulse2 {
            0% { stroke-dashoffset: 180; opacity: 0; }
            12% { opacity: 0.85; }
            50% { opacity: 1; }
            88% { opacity: 0.85; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          
          @keyframes flowPulse3 {
            0% { stroke-dashoffset: 220; opacity: 0; }
            8% { opacity: 0.95; }
            50% { opacity: 1; }
            92% { opacity: 0.95; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          
          .nn-node {
            animation: nodeGlow 3s ease-in-out infinite;
            transition: transform 0.15s ease-out;
          }
          
          .nn-connection-bg {
            opacity: 0.45;
          }
          
          .nn-flow-1 {
            stroke-dasharray: 20 180;
            animation: flowPulse1 1.4s ease-in-out infinite;
          }
          
          .nn-flow-2 {
            stroke-dasharray: 18 182;
            animation: flowPulse2 1.1s ease-in-out infinite;
          }
          
          .nn-flow-3 {
            stroke-dasharray: 22 178;
            animation: flowPulse3 1.7s ease-in-out infinite;
          }
          
          @keyframes energyTravel {
            0% { offset-distance: 0%; opacity: 0; }
            8% { opacity: 1; }
            92% { opacity: 1; }
            100% { offset-distance: 100%; opacity: 0; }
          }
          
          @keyframes particlePulse {
            0%, 100% { r: 4; filter: drop-shadow(0 0 6px currentColor); }
            50% { r: 6; filter: drop-shadow(0 0 12px currentColor) drop-shadow(0 0 20px currentColor); }
          }
          
          .energy-particle {
            animation: energyTravel var(--duration, 3s) linear forwards;
          }
        `}
      </style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img 
                src="https://meee.com.tw/pjqG5sC.png" 
                alt="AI-ECHO Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {sections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    activeTab === item.id ? 'text-blue-600' : 'text-slate-600'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-blue-600 p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 shadow-lg animate-in slide-in-from-top-5">
            <div className="px-4 pt-2 pb-4 space-y-2">
              {sections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header ref={heroRef} className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white pt-24 pb-32 overflow-hidden">
        {/* Neural Network Particles Canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full pointer-events-none" 
          style={{ zIndex: 1 }} 
        />
        {/* Deep Neural Network Background */}
        <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 1, opacity: 0.45 }}>
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.5 }} />
            </linearGradient>
            {/* Gradient 1: Blue to Cyan */}
            <linearGradient id="flowGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
              <stop offset="20%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#22d3ee', stopOpacity: 1 }} />
              <stop offset="80%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0 }} />
            </linearGradient>
            {/* Gradient 2: Purple to Pink */}
            <linearGradient id="flowGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0 }} />
              <stop offset="25%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
              <stop offset="75%" style={{ stopColor: '#e879f9', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#f0abfc', stopOpacity: 0 }} />
            </linearGradient>
            {/* Gradient 3: Teal to Green */}
            <linearGradient id="flowGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#14b8a6', stopOpacity: 0 }} />
              <stop offset="20%" style={{ stopColor: '#2dd4bf', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#34d399', stopOpacity: 1 }} />
              <stop offset="80%" style={{ stopColor: '#4ade80', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#86efac', stopOpacity: 0 }} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="flowGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="superGlow">
              <feGaussianBlur stdDeviation="6" result="blur1"/>
              <feGaussianBlur stdDeviation="3" result="blur2"/>
              <feMerge>
                <feMergeNode in="blur1"/>
                <feMergeNode in="blur2"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Static connection lines (background) */}
          {[15, 30, 45, 60, 75].map((y1, i) => 
            [20, 35, 50, 65, 80].map((y2, j) => (
              <line key={`l1bg-${i}-${j}`} x1="8%" y1={`${y1}%`} x2="28%" y2={`${y2}%`} 
                stroke="url(#connectionGradient)" strokeWidth="1" className="nn-connection-bg" />
            ))
          )}
          {[20, 35, 50, 65, 80].map((y1, i) => 
            [22, 38, 54, 70].map((y2, j) => (
              <line key={`l2bg-${i}-${j}`} x1="28%" y1={`${y1}%`} x2="48%" y2={`${y2}%`} 
                stroke="url(#connectionGradient)" strokeWidth="1" className="nn-connection-bg" />
            ))
          )}
          {[22, 38, 54, 70].map((y1, i) => 
            [25, 42, 58, 75].map((y2, j) => (
              <line key={`l3bg-${i}-${j}`} x1="48%" y1={`${y1}%`} x2="68%" y2={`${y2}%`} 
                stroke="url(#connectionGradient)" strokeWidth="1" className="nn-connection-bg" />
            ))
          )}
          {[25, 42, 58, 75].map((y1, i) => 
            [35, 50, 65].map((y2, j) => (
              <line key={`l4bg-${i}-${j}`} x1="68%" y1={`${y1}%`} x2="88%" y2={`${y2}%`} 
                stroke="url(#connectionGradient)" strokeWidth="1" className="nn-connection-bg" />
            ))
          )}
          
          {/* Canvas will be used for particles instead of SVG */}
          
          {/* Layer 1 Nodes (Input) - with mouse interaction */}
          {[15, 30, 45, 60, 75].map((y, i) => {
            const offset = getNodeOffset(8, y);
            return (
              <g key={`n1-${i}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: 'transform 0.15s ease-out' }}>
                <circle cx="8%" cy={`${y}%`} r="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" filter="url(#glow)" className="nn-node" style={{ animationDelay: `${i * 0.2}s` }} />
                <circle cx="8%" cy={`${y}%`} r="4" fill="#3b82f6" className="nn-node" style={{ animationDelay: `${i * 0.2}s` }} />
              </g>
            );
          })}
          
          {/* Layer 2 Nodes (Hidden 1) */}
          {[20, 35, 50, 65, 80].map((y, i) => {
            const offset = getNodeOffset(28, y);
            return (
              <g key={`n2-${i}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: 'transform 0.2s ease-out' }}>
                <circle cx="28%" cy={`${y}%`} r="7" fill="#1e3a5f" stroke="#06b6d4" strokeWidth="2" filter="url(#glow)" className="nn-node" style={{ animationDelay: `${i * 0.25}s` }} />
                <circle cx="28%" cy={`${y}%`} r="3.5" fill="#06b6d4" className="nn-node" style={{ animationDelay: `${i * 0.25}s` }} />
              </g>
            );
          })}
          
          {/* Layer 3 Nodes (Hidden 2) */}
          {[22, 38, 54, 70].map((y, i) => {
            const offset = getNodeOffset(48, y);
            return (
              <g key={`n3-${i}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: 'transform 0.15s ease-out' }}>
                <circle cx="48%" cy={`${y}%`} r="7" fill="#1e3a5f" stroke="#8b5cf6" strokeWidth="2" filter="url(#glow)" className="nn-node" style={{ animationDelay: `${i * 0.3}s` }} />
                <circle cx="48%" cy={`${y}%`} r="3.5" fill="#8b5cf6" className="nn-node" style={{ animationDelay: `${i * 0.3}s` }} />
              </g>
            );
          })}
          
          {/* Layer 4 Nodes (Hidden 3) */}
          {[25, 42, 58, 75].map((y, i) => {
            const offset = getNodeOffset(68, y);
            return (
              <g key={`n4-${i}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: 'transform 0.15s ease-out' }}>
                <circle cx="68%" cy={`${y}%`} r="7" fill="#1e3a5f" stroke="#06b6d4" strokeWidth="2" filter="url(#glow)" className="nn-node" style={{ animationDelay: `${i * 0.35}s` }} />
                <circle cx="68%" cy={`${y}%`} r="3.5" fill="#06b6d4" className="nn-node" style={{ animationDelay: `${i * 0.35}s` }} />
              </g>
            );
          })}
          
          {/* Layer 5 Nodes (Output) */}
          {[35, 50, 65].map((y, i) => {
            const offset = getNodeOffset(88, y);
            return (
              <g key={`n5-${i}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: 'transform 0.15s ease-out' }}>
                <circle cx="88%" cy={`${y}%`} r="9" fill="#1e3a5f" stroke="#10b981" strokeWidth="2" filter="url(#glow)" className="nn-node" style={{ animationDelay: `${i * 0.4}s` }} />
                <circle cx="88%" cy={`${y}%`} r="5" fill="#10b981" className="nn-node" style={{ animationDelay: `${i * 0.4}s` }} />
              </g>
            );
          })}
        </svg>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20" style={{ zIndex: 2 }}>
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10" style={{ zIndex: 10 }}>
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-blue-200 text-sm mb-6 backdrop-blur-sm">
            <FileText className="w-4 h-4" />
            <span>Journal of the American Heart Association 2026 (In Press), Impact Factor: 6.106</span>
          </div>
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300">
              Automated classification of mitral and tricuspid regurgitation<br />
              with explainability and real-world practice experience
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            國立成功大學醫院團隊與金萬林攜手研發，針對二尖瓣 (MR) 與三尖瓣逆流 (TR) 的全自動 AI 診斷模型。
            解決傳統超音波判讀耗時、主觀性強的痛點，實現快速且精準的臨床篩檢。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => scrollToSection('solution')}
              className="bg-white text-blue-900 px-8 py-3.5 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              了解核心技術 <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollToSection('results')}
              className="bg-blue-800/50 backdrop-blur-sm border border-blue-400/30 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-blue-800/70 transition-all flex items-center justify-center gap-2"
            >
              查看驗證數據
            </button>
          </div>
        </div>
      </header>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">The Challenge</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">為什麼這項研究很重要？</h3>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              心臟瓣膜逆流在臨床實務中並不少見，但往往容易被低估。若未能及時診斷具有臨床意義的逆流程度，可能影響後續評估與治療時機，進而對心臟功能造成不良影響。現行臨床診斷主要面臨三大挑戰:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 text-red-600">
                <Clock className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">耗時且依賴經驗</h4>
              <p className="text-slate-600 leading-relaxed">
                超音波檢查需要醫師手動選取視角並進行測量。經驗豐富的醫師與資淺醫師之間可能存在判讀差異 (Inter-observer variability)。
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600">
                <Brain className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">現有 AI 缺乏解釋性</h4>
              <p className="text-slate-600 leading-relaxed">
                許多現有的深度學習模型是「黑盒子」，僅給出結果卻無法標示病灶位置，難以讓臨床醫師信服並應用於決策。
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                <Activity className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">生理訊號混淆</h4>
              <p className="text-slate-600 leading-relaxed">
                傳統影像分割模型常將正常的血流（如心室充盈或流出）誤判為逆流，導致偽陽性 (False Positives) 增加。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 bg-slate-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Our Methodology</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">創新的「流體感知」AI 架構</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                本研究提出了一套端到端 (End-to-End) 的深度學習流程。不同於單純的影像分類，此模型結合了**解剖結構定位**與**時間相位偵測**。
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900">自動視角選擇 (View Selection)</h4>
                    <p className="text-slate-600 text-sm">從原始 DICOM 檔案中自動辨識並選取標準切面（如 A4C, PLAX），無需人工介入。</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900">收縮期相位感知 (Systolic-Gated)</h4>
                    <p className="text-slate-600 text-sm">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium text-xs mr-2">關鍵創新</span>
                      模型能識別心臟收縮期與舒張期，僅在收縮期分析逆流，有效過濾正常的舒張期血流干擾。
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900">解剖結構限制 (Anatomy Restriction)</h4>
                    <p className="text-slate-600 text-sm">利用語義分割技術標記心房區域，確保系統只關注發生在心房內的異常逆流訊號。</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 w-full">
              {/* Visual Representation of the Pipeline */}
              <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-500 font-mono">DICOM</div>
                    <ArrowRight className="text-slate-400" />
                    <div className="flex-1 font-semibold text-slate-700">原始超音波影像</div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="h-8 w-0.5 bg-slate-300"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                      <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-xs font-bold text-blue-900">時間偵測</div>
                      <div className="text-[10px] text-blue-700">區分收縮/舒張</div>
                    </div>
                    <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 text-center">
                      <Heart className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                      <div className="text-xs font-bold text-teal-900">空間定位</div>
                      <div className="text-[10px] text-teal-700">辨識瓣膜與心房</div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="h-8 w-0.5 bg-slate-300"></div>
                  </div>

                  <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg text-center">
                    <div className="font-bold text-lg mb-1">嚴重度分級</div>
                    <div className="text-blue-100 text-sm flex justify-center gap-3">
                      <span>無/輕度</span>
                      <span>•</span>
                      <span>中度</span>
                      <span>•</span>
                      <span>重度</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center text-xs text-slate-400">
                  * 系統全自動運行，平均僅需 7 秒
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Performance</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">卓越的準確度與真實世界驗證</h3>
            <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
              模型經過內部測試（NCKUH）與外部多中心驗證（郭綜合醫院、衛福部臺南醫院），展現極高的穩定性。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center">
              <div className="text-4xl font-extrabold text-blue-600 mb-2">0.98+</div>
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">AUC (內部測試)</div>
              <p className="text-xs text-slate-500 mt-2">針對中重度以上逆流的辨識能力極佳</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-teal-50 border border-teal-100 text-center">
              <div className="text-4xl font-extrabold text-teal-600 mb-2">&gt;97%</div>
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">陰性預測值 (NPV)</div>
              <p className="text-xs text-slate-500 mt-2">極低的漏診率，非常適合做為篩檢工具</p>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
              <div className="text-4xl font-extrabold text-indigo-600 mb-2">0.94</div>
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">AUC (外部驗證)</div>
              <p className="text-xs text-slate-500 mt-2">跨醫院、跨機台仍保持高水準表現</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-4xl font-extrabold text-slate-600 mb-2">6.8s</div>
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">處理速度</div>
              <p className="text-xs text-slate-500 mt-2">比人工判讀快約 50% (人工約需 13.4s)</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-2/3">
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <ShieldCheck className="text-green-400 w-8 h-8" />
                  強大的「排除」能力 (Rule-out Capability)
                </h4>
                <p className="text-slate-300 leading-relaxed mb-6">
                  研究顯示，此系統最大的優勢在於其極高的**陰性預測值 (NPV)**。這意味著如果 AI 判斷該病患「沒有」嚴重逆流，其可信度極高。
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>適用於初級照護篩檢</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>減少不必要的專科轉診</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>各年齡層表現一致</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>不受左心室射出率 (LVEF) 影響</span>
                  </div>
                </div>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-400 mb-2">99%</div>
                    <div className="text-sm text-slate-200">內部測試 TR NPV</div>
                  </div>
                  <div className="my-4 border-t border-white/10"></div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-400 mb-2">98%</div>
                    <div className="text-sm text-slate-200">內部測試 MR NPV</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Clinical Impact</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">重新定義臨床工作流程</h3>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6 items-start bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full text-blue-600">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">賦能非心臟專科醫師</h4>
                <p className="text-slate-600">在缺乏心臟專科醫師的基層醫療或資源匱乏地區，此系統可作為可靠的把關者，協助醫師快速判斷是否需要進一步轉診。</p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex-shrink-0 bg-teal-100 p-3 rounded-full text-teal-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">自動化分流與優先排序</h4>
                <p className="text-slate-600">系統可自動掃描大量超音波影像，標記出高風險（中重度逆流）病患，讓專科醫師能優先處理緊急案例，提升醫療效率。</p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-full text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">可解釋性增強醫病溝通</h4>
                <p className="text-slate-600">系統不僅給出診斷，還能視覺化標示出逆流的血流位置（Flow Maps），有助於醫師向病患解釋病情。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h5 className="text-white font-bold text-lg mb-4">論文資訊</h5>
              <p className="mb-2 italic">Automated classification of mitral and tricuspid regurgitation with explainability and real-world practice experience</p>
              <p className="text-sm">Accepted by Journal of the American Heart Association 2026 (In Press)</p>
            </div>
            <div>
              <h5 className="text-white font-bold text-lg mb-4">研究團隊</h5>
              <p className="text-sm mb-2">國立成功大學醫院 (NCKUH)</p>
              <p className="text-sm mb-2">金萬林企業股份有限公司 (KIM FOREST ENTERPRISE CO., LTD)</p>
              <p className="text-sm">作者：Wei-Chen Lin, Yi-Ting Li, Yu-De Chen, Ting-An Hsiao, Wen-Yao Li, Wei-Chuan Tsai, Ping-Yen Liu, Mu-Shiang Huang</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex justify-start">
            <img 
              src="https://i.meee.com.tw/sJFzPm5.png" 
              alt="金萬林企業股份有限公司" 
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PaperPresentation;