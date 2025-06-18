import React, { useState, useEffect } from 'react'
import SimpleConnectButton from '../components/SimpleConnectButton'
import PaymasterBanner from '../components/PaymasterBanner'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { useCHIPBalance } from '../hooks/useCHIPToken'
import { useCasinoBank } from '../hooks/useCasinoBank'

const HomePageResponsive = ({ onNavigateToGame }) => {
  const [isMobile, setIsMobile] = useState(false)
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { balance, isLoading: isBalanceLoading } = useCHIPBalance()
  const { hasClaimedFreeChips, claimFreeChips, isLoading: isClaimLoading } = useCasinoBank()
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
            width: isMobile ? '40px' : '60px',
            height: isMobile ? '56px' : '80px',
            background: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '1.5rem' : '2rem',
            color: '#1f2937',
            transform: 'rotate(-15deg)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <svg width={isMobile ? "30" : "40"} height={isMobile ? "30" : "40"} viewBox="0 0 24 24" fill="#1f2937">
              <path d="M12 2C12 2 5 8.5 5 14C5 16.5 6.5 18 8.5 18C10 18 11 17 11 15.5C11 17 10 18.5 10 20C10 21 10.5 22 12 22C13.5 22 14 21 14 20C14 18.5 13 17 13 15.5C13 17 14 18 15.5 18C17.5 18 19 16.5 19 14C19 8.5 12 2 12 2Z"/>
            </svg>
          </div>
          <div style={{
            position: 'absolute',
            top: '30%',
            right: '20%',
            width: isMobile ? '40px' : '60px',
            height: isMobile ? '56px' : '80px',
            background: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '1.5rem' : '2rem',
            color: '#dc2626',
            transform: 'rotate(15deg)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <svg width={isMobile ? "30" : "40"} height={isMobile ? "30" : "40"} viewBox="0 0 24 24" fill="#dc2626">
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
            width: isMobile ? '40px' : '50px',
            height: isMobile ? '40px' : '50px',
            background: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transform: 'rotate(-10deg)'
          }}>
            <svg width={isMobile ? "24" : "30"} height={isMobile ? "24" : "30"} viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#1f2937" strokeWidth="2"/>
              <circle cx="8" cy="8" r="1.5" fill="#1f2937"/>
              <circle cx="12" cy="12" r="1.5" fill="#1f2937"/>
              <circle cx="16" cy="16" r="1.5" fill="#1f2937"/>
            </svg>
          </div>
          <div style={{
            position: 'absolute',
            bottom: '25%',
            left: '20%',
            right: '20%',
            height: isMobile ? '6px' : '8px',
            background: 'linear-gradient(to right, #ef4444 0%, #ef4444 50%, #22c55e 50%, #22c55e 100%)',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              position: 'absolute',
              left: '50%',
              top: isMobile ? '-6px' : '-8px',
              width: isMobile ? '18px' : '24px',
              height: isMobile ? '18px' : '24px',
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
      description: 'Spin the wheel',
      gradient: 'linear-gradient(135deg, #7c2d12 0%, #f59e0b 50%, #d97706 100%)',
      hoverColor: 'rgba(245, 158, 11, 0.5)',
      playButtonColor: 'rgba(245, 158, 11, 0.9)',
      available: true,
      visual: (
        <>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '80px' : '100px',
            height: isMobile ? '80px' : '100px',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #dc2626 0deg 10deg, #1f2937 10deg 20deg, #dc2626 20deg 30deg, #1f2937 30deg 40deg)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            border: '4px solid #d4a574'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '30%',
              height: '30%',
              borderRadius: '50%',
              background: '#fbbf24',
              border: '2px solid #d4a574'
            }} />
          </div>
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '20px solid #fbbf24'
          }} />
        </>
      )
    },
    {
      id: 'slots',
      name: 'Slots',
      description: 'Spin to win',
      gradient: 'linear-gradient(135deg, #581c87 0%, #8b5cf6 50%, #6d28d9 100%)',
      hoverColor: 'rgba(139, 92, 246, 0.5)',
      playButtonColor: 'rgba(139, 92, 246, 0.9)',
      available: true,
      visual: (
        <>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            gap: isMobile ? '8px' : '12px'
          }}>
            {['🍒', '7️⃣', '💎'].map((symbol, index) => (
              <div
                key={index}
                style={{
                  width: isMobile ? '40px' : '50px',
                  height: isMobile ? '50px' : '60px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transform: `translateY(${index === 1 ? '0' : index === 0 ? '-10px' : '10px'})`
                }}
              >
                {symbol}
              </div>
            ))}
          </div>
        </>
      )
    },
    {
      id: 'poker',
      name: 'Poker',
      description: 'Coming soon',
      gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
      available: false
    },
    {
      id: 'baccarat',
      name: 'Baccarat',
      description: 'Coming soon',
      gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
      available: false
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
        height: isMobile ? '60px' : '70px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '0 1rem' : '0 2rem'
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
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: 'bold'
          }}>
            <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="none">
              <path d="M12 2L12 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 7C7 7 10 10 12 12C14 10 17 7 17 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 12C5 12 8 15 12 17C16 15 19 12 19 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 17C3 17 7 20 12 22C17 20 21 17 21 17" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>FernBet</span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <SimpleConnectButton variant="navbar" />
          </div>
        </div>
      </nav>

      {/* Paymaster Banner */}
      <PaymasterBanner />

      {/* Main Content */}
      <main style={{
        paddingTop: isMobile ? '60px' : '70px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Hero Section */}
        <section style={{
          padding: isMobile ? '1.5rem 1rem' : '3rem 2rem 2rem',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h1 style={{
            fontSize: isMobile ? '1.75rem' : '2.5rem',
            fontWeight: 'bold',
            margin: '0 0 0.75rem 0',
            background: 'linear-gradient(to right, #60a5fa, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome to FernBet Casino
          </h1>
          <p style={{
            fontSize: isMobile ? '0.875rem' : '1.2rem',
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto',
            marginBottom: isMobile ? '1.5rem' : '2rem'
          }}>
            Play provably fair games powered by Chainlink VRF
          </p>
          
          {/* Quick Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '1.5rem' : '4rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: isMobile ? '1.25rem' : '1.8rem', fontWeight: 'bold', color: '#34d399' }}>1,247</div>
              <div style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', color: '#64748b' }}>Players Online</div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '1.25rem' : '1.8rem', fontWeight: 'bold', color: '#60a5fa' }}>99%</div>
              <div style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', color: '#64748b' }}>RTP</div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '1.25rem' : '1.8rem', fontWeight: 'bold', color: '#fbbf24' }}>
                <span style={{ fontFamily: 'sans-serif' }}>₿</span>15.8
              </div>
              <div style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', color: '#64748b' }}>Won Today</div>
            </div>
          </div>
        </section>

        {/* Welcome Banner for Non-Connected Users */}
        {!isConnected && (
          <section style={{
            padding: isMobile ? '1rem' : '1.5rem 2rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(251, 191, 36, 0.1))',
            borderBottom: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: isMobile ? '2rem' : '3rem',
                marginBottom: '0.5rem'
              }}>
                🎁
              </div>
              <h2 style={{
                fontSize: isMobile ? '1.25rem' : '1.75rem',
                fontWeight: 'bold',
                color: '#fbbf24',
                marginBottom: '0.5rem'
              }}>
                Get 5 Free CHIP Tokens!
              </h2>
              <p style={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                color: '#94a3b8',
                marginBottom: '1.5rem'
              }}>
                Connect your wallet to claim your free chips and start playing
              </p>
              <SimpleConnectButton variant="default" />
            </div>
          </section>
        )}

        {/* CHIP Balance and Free Chips Section */}
        {isConnected && (
          <section style={{
            padding: isMobile ? '1rem' : '1.5rem 2rem',
            background: 'rgba(16, 185, 129, 0.05)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              {/* CHIP Balance */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: isMobile ? '40px' : '48px',
                  height: isMobile ? '40px' : '48px',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  color: '#78350f',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                }}>
                  C
                </div>
                <div>
                  <div style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', color: '#94a3b8' }}>
                    Your CHIP Balance
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? '1.25rem' : '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#fbbf24' 
                  }}>
                    {isBalanceLoading ? '...' : balance ? `${balance} CHIP` : '0 CHIP'}
                  </div>
                </div>
              </div>

              {/* Free Chips Button */}
              {!hasClaimedFreeChips && (
                <button
                  onClick={async () => {
                    // Force switch to Base Sepolia before claiming
                    if (chainId !== baseSepolia.id) {
                      try {
                        await switchChain({ chainId: baseSepolia.id })
                        // Wait a bit for the switch to complete
                        setTimeout(() => {
                          claimFreeChips()
                        }, 1000)
                      } catch (error) {
                        console.error('Failed to switch network:', error)
                      }
                    } else {
                      claimFreeChips()
                    }
                  }}
                  disabled={isClaimLoading}
                  style={{
                    background: isClaimLoading 
                      ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                      : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: isMobile ? '0.75rem 1.5rem' : '0.875rem 2rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    fontWeight: '600',
                    cursor: isClaimLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!isClaimLoading) {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isClaimLoading) {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>🎁</span>
                  {isClaimLoading ? 'Claiming...' : 'Claim 5 Free CHIP'}
                </button>
              )}

              {hasClaimedFreeChips && (
                <div style={{
                  color: '#10b981',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>✅</span>
                  Free chips claimed!
                </div>
              )}
            </div>
          </section>
        )}

        {/* Games Grid */}
        <section style={{
          flex: 1,
          padding: isMobile ? '1.5rem 1rem' : '3rem 2rem',
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: isMobile ? '1rem' : '1.5rem'
          }}>
            {games.map(game => (
              <div 
                key={game.id}
                onClick={async () => {
                  if (!isConnected) {
                    alert('Please connect your wallet to play!')
                    return
                  }
                  // Force switch to Base Sepolia before playing
                  if (chainId !== baseSepolia.id) {
                    try {
                      await switchChain({ chainId: baseSepolia.id })
                      // Wait a bit for the switch to complete
                      setTimeout(() => {
                        if (game.available) {
                          onNavigateToGame(game.id)
                        }
                      }, 1000)
                    } catch (error) {
                      console.error('Failed to switch network:', error)
                    }
                  } else if (game.available) {
                    onNavigateToGame(game.id)
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: game.available ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  aspectRatio: isMobile ? '2/1' : '16/9',
                  opacity: game.available ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (game.available && !isMobile) {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)'
                    e.currentTarget.style.borderColor = game.hoverColor || 'rgba(255, 255, 255, 0.3)'
                    const overlay = e.currentTarget.querySelector('.play-overlay')
                    if (overlay) overlay.style.opacity = '1'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    const overlay = e.currentTarget.querySelector('.play-overlay')
                    if (overlay) overlay.style.opacity = '0'
                  }
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
                    <svg width={isMobile ? "36" : "48"} height={isMobile ? "36" : "48"} viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                      <path d="M8 9H16M8 12H16M8 15H12" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                    </svg>
                  )}
                  
                  {game.available && !isMobile && (
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
                      top: isMobile ? '8px' : '10px',
                      right: isMobile ? '8px' : '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      padding: isMobile ? '2px 8px' : '4px 12px',
                      fontSize: isMobile ? '0.625rem' : '0.7rem',
                      color: '#94a3b8',
                      fontWeight: '500'
                    }}>
                      Coming Soon
                    </div>
                  )}
                  
                  {game.available && !isConnected && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>🔒</span>
                      <span style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: '#fbbf24' }}>
                        Connect to Play
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Game Info */}
                <div style={{
                  padding: isMobile ? '12px' : '20px',
                  height: '30%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h3 style={{
                    margin: '0 0 3px 0',
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    fontWeight: 'bold',
                    color: game.available ? '#e2e8f0' : '#94a3b8'
                  }}>
                    {game.name}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: isMobile ? '0.75rem' : '0.9rem',
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
        padding: isMobile ? '1.5rem 1rem' : '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: isMobile ? '0.75rem' : '1rem',
          fontSize: isMobile ? '1rem' : '1.2rem'
        }}>
          <svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L12 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 7C7 7 10 10 12 12C14 10 17 7 17 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
            <path d="M5 12C5 12 8 15 12 17C16 15 19 12 19 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 17C3 17 7 20 12 22C17 20 21 17 21 17" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontWeight: 'bold' }}>FernBet</span>
        </div>
        <p style={{
          color: '#64748b',
          fontSize: isMobile ? '0.75rem' : '0.9rem',
          margin: 0
        }}>
          A portfolio project showcasing modern web development with provably fair casino gaming
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: isMobile ? '1rem' : '2rem',
          marginTop: isMobile ? '1rem' : '1.5rem',
          fontSize: isMobile ? '0.75rem' : '0.9rem'
        }}>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Smart Contracts</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Documentation</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>GitHub</a>
        </div>
      </footer>
    </div>
  )
}

export default HomePageResponsive