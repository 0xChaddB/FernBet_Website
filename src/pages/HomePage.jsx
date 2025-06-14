import React, { useState } from 'react'
import SmartWalletConnect from '../components/SmartWalletConnect'

const HomePage = ({ onNavigateToGame }) => {
  const [activeSection, setActiveSection] = useState('home')

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
    setActiveSection(sectionId)
  }

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">FernBet</span>
          </div>
          
          <ul className="nav-menu">
            <li><a href="#home" className="nav-item active" onClick={() => scrollToSection('home')}>Home</a></li>
            <li><a href="#games" className="nav-item" onClick={() => scrollToSection('games')}>Games</a></li>
            <li><a href="#about" className="nav-item" onClick={() => scrollToSection('about')}>About</a></li>
          </ul>
          
          <div>
            <SmartWalletConnect variant="navbar" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <span className="hero-icon">🌿</span>
          <h1 className="hero-title">FernBet Casino</h1>
          <div className="hero-subtitle">Where Nature Meets Fortune</div>
          <p className="hero-description">
            FernBet leverages Chainlink VRF to generate truly random numbers, 
            ensuring complete fairness and transparency in every game outcome.
          </p>
          <div className="hero-buttons">
            <button 
              onClick={onNavigateToGame}
              className="btn btn-primary"
            >
              🎲 Start Playing
            </button>
            <a href="#about" className="btn btn-outline" onClick={() => scrollToSection('about')}>
              🌿 Learn More
            </a>
          </div>
          
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value">1,247</div>
              <div className="stat-label">Players Online</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">₿15.8</div>
              <div className="stat-label">Won Today</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">99%</div>
              <div className="stat-label">Fair Play</div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="section">
        <div className="container">
          <h2 className="section-title">🎮 Our Games</h2>
          <p className="section-description">
            Choose from our carefully crafted selection of classic casino games
          </p>
          <div className="grid grid-3">
            <div className="card">
              <span className="card-icon">♠️</span>
              <h3 className="card-title">Blackjack</h3>
              <p className="card-description">Beat the dealer with strategy and skill in this timeless card game</p>
              <div style={{marginTop: '1.5rem'}}>
                <button onClick={onNavigateToGame} className="btn btn-primary">
                  Play Now
                </button>
              </div>
            </div>
            
            <div className="card">
              <span className="card-icon">🎰</span>
              <h3 className="card-title">Slots</h3>
              <p className="card-description">Spin the reels and discover your fortune with our engaging slot machines</p>
              <div style={{marginTop: '1.5rem'}}>
                <a href="#" className="btn btn-outline">Coming Soon</a>
              </div>
            </div>
            
            <div className="card">
              <span className="card-icon">🎲</span>
              <h3 className="card-title">More Games</h3>
              <p className="card-description">More exciting games are on the way! Stay tuned for updates</p>
              <div style={{marginTop: '1.5rem'}}>
                <a href="#" className="btn btn-outline">Notify Me</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <div className="grid grid-2" style={{alignItems: 'flex-start', gap: '4rem'}}>
            <div>
              <span style={{fontSize: '4rem', display: 'block', marginBottom: '2rem'}}>🌿</span>
              <h2 className="section-title" style={{textAlign: 'left', marginBottom: '2rem'}}>
                Built for the Future
              </h2>
              <div style={{display: 'flex', gap: '4rem', alignItems: 'flex-start'}}>
                <div style={{flex: 1}}>
                  <div style={{fontSize: '1.125rem', color: '#cbd5e1', lineHeight: '1.8', marginBottom: '2rem'}}>
                    <p style={{marginBottom: '1.5rem'}}>
                      FernBet leverages Chainlink VRF (Verifiable Random Function) to generate truly random numbers, 
                      ensuring complete fairness and transparency in every game outcome.
                    </p>
                    <p style={{marginBottom: '1.5rem'}}>
                      Our casino logic runs 100% on-chain, meaning every bet, win, and transaction 
                      is permanently recorded and verifiable on the blockchain.
                    </p>
                    <p>
                      Using Coinbase's Smart Wallet Kit, we provide seamless account creation and 
                      a simplified gaming experience without compromising on security or decentralization.
                    </p>
                  </div>
                  <a href="#" className="btn btn-primary">Explore Smart Contracts</a>
                </div>
                
                <div className="card" style={{flex: '0 0 auto', minWidth: '300px'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <div style={{
                        width: '4rem', 
                        height: '4rem', 
                        background: '#10b981', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '1.5rem'
                      }}>
                        🔗
                      </div>
                      <div>
                        <div style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#a7f3d0'}}>Chainlink VRF</div>
                        <div style={{color: '#94a3b8'}}>Verifiable randomness</div>
                      </div>
                    </div>
                    
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <div style={{
                        width: '4rem', 
                        height: '4rem', 
                        background: '#10b981', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '1.5rem'
                      }}>
                        ⛓️
                      </div>
                      <div>
                        <div style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#a7f3d0'}}>100% On-Chain</div>
                        <div style={{color: '#94a3b8'}}>Transparent casino logic</div>
                      </div>
                    </div>
                    
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <div style={{
                        width: '4rem', 
                        height: '4rem', 
                        background: '#10b981', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '1.5rem'
                      }}>
                        💼
                      </div>
                      <div>
                        <div style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#a7f3d0'}}>Smart Wallet Kit</div>
                        <div style={{color: '#94a3b8'}}>Seamless Coinbase integration</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div>
              <div className="logo" style={{marginBottom: '1.5rem'}}>
                <span className="logo-icon">🌿</span>
                <span className="logo-text">FernBet</span>
              </div>
              <p style={{color: '#94a3b8', maxWidth: '24rem', marginBottom: '1.5rem', lineHeight: '1.6'}}>
                A portfolio project showcasing modern web development with casino gaming elements.
              </p>
            </div>
            <div>
              <h3 style={{fontWeight: 'bold', color: '#34d399', marginBottom: '1.5rem', fontSize: '1.125rem'}}>Games</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#94a3b8'}}>
                <a href="#" style={{color: '#94a3b8', textDecoration: 'none'}}>♠️ Blackjack</a>
                <a href="#" style={{color: '#94a3b8', textDecoration: 'none'}}>🎰 Slots</a>
                <a href="#" style={{color: '#94a3b8', textDecoration: 'none'}}>🎲 Coming Soon</a>
              </div>
            </div>
            <div>
              <h3 style={{fontWeight: 'bold', color: '#34d399', marginBottom: '1.5rem', fontSize: '1.125rem'}}>Portfolio</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#94a3b8'}}>
                <a href="#" style={{color: '#94a3b8', textDecoration: 'none'}}>💻 Source Code</a>
                <a href="#" style={{color: '#94a3b8', textDecoration: 'none'}}>📧 Contact</a>
                <a href="#" style={{color: '#94a3b8', textDecoration: 'none'}}>🌐 My Portfolio</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 FernBet - Portfolio Project | Built with React & Modern Web Technologies 🌿</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage