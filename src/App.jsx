import React, { useState, useEffect } from 'react';

const FernBet = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
    setIsMenuOpen(false);
  };

  // Counter animation
  const Counter = ({ target, label, suffix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      const increment = target / 100;
      const timer = setInterval(() => {
        setCount(prev => {
          if (prev < target) {
            return Math.min(prev + increment, target);
          }
          clearInterval(timer);
          return target;
        });
      }, 20);
      return () => clearInterval(timer);
    }, [target]);

    return (
      <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-emerald-400/30">
        <div className="text-4xl font-bold text-emerald-300 mb-2 drop-shadow-lg">
          {Math.floor(count)}{suffix}
        </div>
        <div className="text-emerald-200 font-medium">{label}</div>
      </div>
    );
  };

  const features = [
    { 
      icon: '🛡️', 
      title: 'Ultra Secure Gaming', 
      desc: 'Military-grade encryption meets blockchain technology for unbreakable security',
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      icon: '⚡', 
      title: 'Lightning Withdrawals', 
      desc: 'Instant payouts powered by smart contracts - no waiting, no delays',
      gradient: 'from-yellow-500 to-orange-600'
    },
    { 
      icon: '🌿', 
      title: 'Provably Fair Nature', 
      desc: 'Every game result is verifiable on-chain - transparency is in our DNA',
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      icon: '💎', 
      title: 'VIP Rewards Forest', 
      desc: 'Exclusive bonuses, cashback, and personalized service for loyal players',
      gradient: 'from-purple-500 to-pink-600'
    },
    { 
      icon: '🌍', 
      title: 'Global Access', 
      desc: 'Play from anywhere with 50+ cryptocurrencies and 24/7 multilingual support',
      gradient: 'from-blue-500 to-cyan-600'
    },
    { 
      icon: '🎯', 
      title: 'Premium Experience', 
      desc: 'Hand-crafted games, exclusive tournaments, and cutting-edge technology',
      gradient: 'from-red-500 to-pink-600'
    }
  ];

  const games = [
    { icon: '♠️', title: 'Blackjack Forest', desc: 'Beat the dealer in our enchanted tables', players: '2.4k' },
    { icon: '🎰', title: 'Mystic Slots', desc: 'Spin through magical reels of fortune', players: '5.8k' },
    { icon: '🎲', title: 'Fern Dice', desc: 'Roll your way to natural victories', players: '1.2k' },
    { icon: '🃏', title: 'Poker Grove', desc: 'Strategic play in our premium rooms', players: '890' },
    { icon: '🎯', title: 'Nature Roulette', desc: 'Where luck meets the wheel of fortune', players: '3.1k' },
    { icon: '💎', title: 'Crystal VIP', desc: 'Exclusive high-limit gaming sanctuary', players: '156' },
    { icon: '🌟', title: 'Stardust Baccarat', desc: 'Elegant card play for refined players', players: '678' },
    { icon: '🎊', title: 'Festival Tournaments', desc: 'Compete in daily prize competitions', players: '4.5k' }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 text-white min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-md border-b-2 border-emerald-500/30 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-3xl animate-pulse">🌿</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                FernBet
              </div>
              <div className="hidden sm:block px-3 py-1 bg-emerald-500/20 rounded-full text-xs text-emerald-300 border border-emerald-500/30">
                LIVE
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'games', label: 'Games' },
                { id: 'features', label: 'Features' },
                { id: 'tournaments', label: 'Tournaments' },
                { id: 'about', label: 'About' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 font-semibold transition-all duration-300 ${
                    activeSection === item.id 
                      ? 'text-emerald-300 bg-emerald-500/20 rounded-lg border border-emerald-500/50' 
                      : 'text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="hidden sm:block px-4 py-2 border-2 border-emerald-500 text-emerald-300 rounded-lg font-semibold hover:bg-emerald-500 hover:text-white transition-all duration-300">
                Login
              </button>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-lg font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Play Now
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-emerald-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-emerald-500/30 pt-4">
              {[
                { id: 'home', label: 'Home' },
                { id: 'games', label: 'Games' },
                { id: 'features', label: 'Features' },
                { id: 'tournaments', label: 'Tournaments' },
                { id: 'about', label: 'About' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left py-3 px-4 text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-20 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-slate-900/80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="text-8xl animate-pulse">🌿</div>
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-emerald-300 via-teal-300 to-green-300 bg-clip-text text-transparent drop-shadow-2xl">
            FernBet Casino
          </h1>
          <div className="text-2xl md:text-3xl text-emerald-200 mb-6 font-semibold">
            Where Nature Meets Fortune
          </div>
          <p className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Discover the most immersive blockchain casino experience. With provably fair games, 
            instant crypto payouts, and a thriving community of over 50,000 players worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-4 rounded-xl font-bold text-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105">
              🎲 Start Playing Now
            </button>
            <button className="border-2 border-emerald-400 text-emerald-300 px-10 py-4 rounded-xl font-bold text-xl hover:bg-emerald-400 hover:text-slate-900 transition-all duration-300 backdrop-blur-sm">
              🌿 Explore Games
            </button>
          </div>
          
          {/* Live stats bar */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-emerald-500/30">
              <div className="text-emerald-300 font-bold text-lg">12,847</div>
              <div className="text-slate-400 text-sm">Online Now</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-emerald-500/30">
              <div className="text-emerald-300 font-bold text-lg">₿1,250.8</div>
              <div className="text-slate-400 text-sm">Won Today</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-emerald-500/30">
              <div className="text-emerald-300 font-bold text-lg">99.9%</div>
              <div className="text-slate-400 text-sm">RTP Average</div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-24 bg-gradient-to-r from-slate-800 to-emerald-800 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              🎮 Game Forest
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Step into our enchanted gaming realm where every spin, deal, and roll brings you closer to fortune
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <div key={index} className="group bg-gradient-to-br from-slate-800/80 to-emerald-900/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-500/30 hover:border-emerald-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 cursor-pointer">
                <div className="text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
                  <h3 className="text-xl font-bold text-emerald-200 mb-2">{game.title}</h3>
                  <p className="text-slate-400 mb-4 text-sm">{game.desc}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-300 text-sm font-semibold">👥 {game.players} active</span>
                    <button className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors">
                      PLAY
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-emerald-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              🌟 Why Choose FernBet
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Experience the perfect blend of cutting-edge technology and natural gaming excellence
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border-2 border-emerald-500/20 hover:border-emerald-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-3xl group-hover:animate-pulse`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-200 mb-4">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section id="tournaments" className="py-24 bg-gradient-to-r from-purple-900 to-emerald-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-emerald-300 bg-clip-text text-transparent">
              🏆 Live Tournaments
            </h2>
            <p className="text-xl text-slate-300">
              Compete against players worldwide for massive prize pools
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-800/50 to-emerald-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-purple-500/30">
              <div className="text-center">
                <div className="text-4xl mb-4">🎰</div>
                <h3 className="text-2xl font-bold text-purple-200 mb-2">Slot Championship</h3>
                <div className="text-3xl font-bold text-yellow-400 mb-2">₿25.5 Prize Pool</div>
                <div className="text-purple-300 mb-4">Ends in 2h 15m</div>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors">
                  Join Now
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-800/50 to-teal-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-emerald-500/30">
              <div className="text-center">
                <div className="text-4xl mb-4">♠️</div>
                <h3 className="text-2xl font-bold text-emerald-200 mb-2">Blackjack Masters</h3>
                <div className="text-3xl font-bold text-yellow-400 mb-2">₿18.2 Prize Pool</div>
                <div className="text-emerald-300 mb-4">Ends in 5h 42m</div>
                <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
                  Join Now
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-800/50 to-red-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-orange-500/30">
              <div className="text-center">
                <div className="text-4xl mb-4">🎲</div>
                <h3 className="text-2xl font-bold text-orange-200 mb-2">Dice Legends</h3>
                <div className="text-3xl font-bold text-yellow-400 mb-2">₿12.8 Prize Pool</div>
                <div className="text-orange-300 mb-4">Ends in 1h 08m</div>
                <button className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors">
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-teal-700">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              🌱 Growing Strong Together
            </h2>
            <p className="text-xl text-emerald-100">
              Join our thriving ecosystem of successful players
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <Counter target={52000} label="Active Players" suffix="+" />
            <Counter target={2100} label="BTC Distributed" />
            <Counter target={99.9} label="Uptime Rate" suffix="%" />
            <Counter target={156} label="Countries Served" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gradient-to-br from-slate-900 to-emerald-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-6xl mb-8">🌿</div>
              <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                Rooted in Excellence
              </h2>
              <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                <p>
                  Like a mighty fern that adapts and thrives in any environment, FernBet has grown 
                  from a small startup to the world's most trusted blockchain casino platform.
                </p>
                <p>
                  Our commitment to transparency, fairness, and player satisfaction has created 
                  a natural ecosystem where everyone can flourish and find their fortune.
                </p>
                <p>
                  With cutting-edge blockchain technology, instant payouts, and games that are 
                  provably fair, we're not just changing the game - we're growing the future.
                </p>
              </div>
              <button className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg transform hover:scale-105">
                🌱 Join Our Growth Story
              </button>
            </div>
            <div className="bg-gradient-to-br from-emerald-800/30 to-teal-800/30 backdrop-blur-sm rounded-3xl p-12 border-2 border-emerald-500/30">
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-2xl">🏆</div>
                  <div>
                    <div className="text-xl font-bold text-emerald-200">Licensed & Regulated</div>
                    <div className="text-slate-400">Curacao Gaming Authority</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl">🔒</div>
                  <div>
                    <div className="text-xl font-bold text-blue-200">SSL Encrypted</div>
                    <div className="text-slate-400">Bank-level security</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-2xl">⚡</div>
                  <div>
                    <div className="text-xl font-bold text-purple-200">Instant Payouts</div>
                    <div className="text-slate-400">Smart contract powered</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl">🌍</div>
                  <div>
                    <div className="text-xl font-bold text-green-200">24/7 Support</div>
                    <div className="text-slate-400">Always here to help</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t-2 border-emerald-500/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="text-3xl">🌿</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  FernBet
                </div>
              </div>
              <p className="text-slate-400 max-w-md mb-6 leading-relaxed">
                The premium blockchain casino where nature meets gaming excellence. 
                Licensed, regulated, and trusted by players worldwide.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors">
                  📧
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  🐦
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
                  💬
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-emerald-400 mb-6 text-lg">Popular Games</h3>
              <div className="space-y-3 text-slate-400">
                <div className="hover:text-emerald-300 cursor-pointer transition-colors">♠️ Blackjack Forest</div>
                <div className="hover:text-emerald-300 cursor-pointer transition-colors">🎰 Mystic Slots</div>
                <div className="hover:text-emerald-300 cursor-pointer transition-colors">🎲 Fern Dice</div>
                <div className="hover:text-emerald-300 cursor-pointer transition-colors">🃏 Poker Grove</div>
                <div className="hover:text-emerald-300 cursor-pointer transition-colors">💎 VIP Crystal</div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-emerald-400 mb-6 text-lg">Support & Info</h3>
              <div className="space-y-3 text-slate-400">
                <div className="hover:text-emerald-300 cursor-pointer transition-colors">🆘 Help Center</div>
                <div className="hover:text-emerald-300 cursor-pointer transition-colors">💬 Live Chat 24/7</div>
                <div className="hover:text-emerald-300 cursor-pointer transition-colors">🎯 Provably Fair</div>
                <div className="hover:text-emerald-300 cursor-pointer transition-colors">🛡️ Responsible Gaming</div>
                <div className="hover:text-emerald-300 cursor-pointer transition-colors">📜 Terms & Privacy</div>
              </div>
            </div>
          </div>
          <div className="border-t border-emerald-500/30 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2025 FernBet Casino. All rights reserved. | Licensed by Curacao Gaming Authority | Play Responsibly 🌿</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FernBet;