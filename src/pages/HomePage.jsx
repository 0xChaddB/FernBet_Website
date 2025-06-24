import React, { useState } from 'react'
import SmartWalletConnect from '../components/SmartWalletConnect'

const HomePage = ({ onNavigateToGame }) => {
  const games = [
    {
      id: 'blackjack',
      name: 'Blackjack',
      description: 'Beat the dealer to 21',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #0f766e 50%, #064e3b 100%)',
      hoverColor: 'rgba(52, 211, 153, 0.5)',
      playButtonColor: 'rgba(52, 211, 153, 0.9)',
      available: true,
      visual: (
        <>
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '60px',
            height: '80px',
            background: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#1f2937',
            transform: 'rotate(-15deg)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#1f2937">
              <path d="M12 2C12 2 5 8.5 5 14C5 16.5 6.5 18 8.5 18C10 18 11 17 11 15.5C11 17 10 18.5 10 20C10 21 10.5 22 12 22C13.5 22 14 21 14 20C14 18.5 13 17 13 15.5C13 17 14 18 15.5 18C17.5 18 19 16.5 19 14C19 8.5 12 2 12 2Z"/>
            </svg>
          </div>
          <div style={{
            position: 'absolute',
            top: '30%',
            right: '20%',
            width: '60px',
            height: '80px',
            background: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#dc2626',
            transform: 'rotate(15deg)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#dc2626">
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
            </svg>
          </div>
        </>
      )
    },
    {
      id: 'dice',
      name: 'Dice',
      description: 'Roll over to win',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1d4ed8 100%)',
      hoverColor: 'rgba(59, 130, 246, 0.5)',
      playButtonColor: 'rgba(59, 130, 246, 0.9)',
      available: true,
      visual: (
        <>
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '25%',
            width: '50px',
            height: '50px',
            background: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transform: 'rotate(-10deg)'
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="2"/>
              <circle cx="8" cy="8" r="1.5" fill="white"/>
              <circle cx="12" cy="12" r="1.5" fill="white"/>
              <circle cx="16" cy="16" r="1.5" fill="white"/>
            </svg>
          </div>
          <div style={{
            position: 'absolute',
            bottom: '25%',
            left: '20%',
            right: '20%',
            height: '8px',
            background: 'linear-gradient(to right, #ef4444 0%, #ef4444 50%, #22c55e 50%, #22c55e 100%)',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '-8px',
              width: '24px',
              height: '24px',
              background: '#ffffff',
              borderRadius: '50%',
              transform: 'translateX(-50%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }} />
          </div>
        </>
      )
    },
    {
      id: 'roulette',
      name: 'Roulette',
      description: 'Coming soon',
      gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
      available: false,
      icon: '🎰'
    },
    {
      id: 'slots',
      name: 'Slots',
      description: 'Coming soon',
      gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
      available: false,
      icon: '🎰'
    },
    {
      id: 'poker',
      name: 'Poker',
      description: 'Coming soon',
      gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
      available: false,
      icon: '🃏'
    },
    {
      id: 'baccarat',
      name: 'Baccarat',
      description: 'Coming soon',
      gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
      available: false,
      icon: '🎮'
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '4px' }}>
              <path d="M12 2L12 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 7C7 7 10 10 12 12C14 10 17 7 17 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 12C5 12 8 15 12 17C16 15 19 12 19 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 17C3 17 7 20 12 22C17 20 21 17 21 17" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>FernBet</span>
          </div>
          
          <SmartWalletConnect variant="navbar" />
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        paddingTop: '70px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Hero Section */}
        <section style={{
          padding: '3rem 2rem 2rem',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: '0 0 1rem 0',
            background: 'linear-gradient(to right, #60a5fa, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome to FernBet Casino
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#94a3b8',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Play provably fair games on Base
          </p>
          
        </section>

        {/* Games Grid */}
        <section style={{
          flex: 1,
          padding: '3rem 2rem',
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {games.map(game => (
              <div 
                key={game.id}
                onClick={() => game.available && onNavigateToGame(game.id)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: game.available ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  aspectRatio: '16/9',
                  opacity: game.available ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (game.available) {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)'
                    e.currentTarget.style.borderColor = game.hoverColor || 'rgba(255, 255, 255, 0.3)'
                    const overlay = e.currentTarget.querySelector('.play-overlay')
                    if (overlay) overlay.style.opacity = '1'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  const overlay = e.currentTarget.querySelector('.play-overlay')
                  if (overlay) overlay.style.opacity = '0'
                }}
              >
                {/* Game Preview */}
                <div style={{
                  width: '100%',
                  height: '70%',
                  background: game.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {game.visual || (
                    <div style={{
                      fontSize: '3rem',
                      opacity: 0.5
                    }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                        <path d="M8 9H16M8 12H16M8 15H12" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                      </svg>
                    </div>
                  )}
                  
                  {game.available && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }} className="play-overlay">
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: game.playButtonColor || 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M5 3L19 12L5 21V3Z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {!game.available && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '0.7rem',
                      color: '#94a3b8',
                      fontWeight: '500'
                    }}>
                      Coming Soon
                    </div>
                  )}
                </div>
                
                {/* Game Info */}
                <div style={{
                  padding: '20px',
                  height: '30%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h3 style={{
                    margin: '0 0 5px 0',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: game.available ? '#e2e8f0' : '#94a3b8'
                  }}>
                    {game.name}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: game.available ? '#94a3b8' : '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    {game.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          fontSize: '1.2rem'
        }}>
          <span>🌿</span>
          <span style={{ fontWeight: 'bold' }}>FernBet</span>
        </div>
        <p style={{
          color: '#64748b',
          fontSize: '0.9rem',
          margin: 0
        }}>
          A portfolio project showcasing modern web development with provably fair casino gaming
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Smart Contracts</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Documentation</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>GitHub</a>
        </div>
      </footer>
    </div>
  )
}

export default HomePage