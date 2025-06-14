import React, { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

const SmartWalletConnect = ({ variant = 'default' }) => {
  const [showModal, setShowModal] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = async () => {
    const coinbaseConnector = connectors.find(connector => 
      connector.name === 'Coinbase Wallet'
    )
    
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector })
      setShowModal(false)
    }
  }

  // Si connecté, afficher le statut selon la variante
  if (isConnected) {
    if (variant === 'navbar') {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            background: '#10b981',
            borderRadius: '50%'
          }} />
          <span style={{ 
            color: '#10b981', 
            fontSize: '0.85rem',
            fontWeight: '500'
          }}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button
            onClick={() => disconnect()}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              fontSize: '0.7rem',
              cursor: 'pointer',
              marginLeft: '0.25rem'
            }}
          >
            ×
          </button>
        </div>
      )
    }
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'rgba(16, 185, 129, 0.1)',
        padding: '0.5rem 1rem',
        borderRadius: '0.75rem',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          background: '#10b981',
          borderRadius: '50%'
        }} />
        <span style={{ 
          color: '#10b981', 
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          style={{
            background: 'transparent',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#ef4444',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          Disconnect
        </button>
      </div>
    )
  }

  // Styles du bouton selon la variante
  const buttonStyles = {
    default: {
      background: 'linear-gradient(135deg, #0052ff, #0040c7)',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0, 82, 255, 0.3)'
    },
    outline: {
      background: 'transparent',
      color: '#34d399',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: '2px solid #34d399',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    small: {
      background: 'linear-gradient(135deg, #0052ff, #0040c7)',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0, 82, 255, 0.3)'
    },
    navbar: {
      background: 'transparent',
      color: '#34d399',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid rgba(52, 211, 153, 0.3)',
      fontSize: '0.85rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  }

  return (
    <>
      {/* Bouton de connexion */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        style={{
          ...buttonStyles[variant],
          opacity: isPending ? 0.7 : 1,
          cursor: isPending ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (isPending) return
          
          if (variant === 'default' || variant === 'small') {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = variant === 'default' 
              ? '0 6px 16px rgba(0, 82, 255, 0.4)'
              : '0 4px 12px rgba(0, 82, 255, 0.4)'
          } else if (variant === 'navbar') {
            e.target.style.background = 'rgba(52, 211, 153, 0.1)'
            e.target.style.borderColor = 'rgba(52, 211, 153, 0.5)'
          } else {
            e.target.style.background = '#34d399'
            e.target.style.color = '#1f2937'
          }
        }}
        onMouseLeave={(e) => {
          if (isPending) return
          
          if (variant === 'default' || variant === 'small') {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = variant === 'default'
              ? '0 4px 12px rgba(0, 82, 255, 0.3)'
              : '0 2px 8px rgba(0, 82, 255, 0.3)'
          } else if (variant === 'navbar') {
            e.target.style.background = 'transparent'
            e.target.style.borderColor = 'rgba(52, 211, 153, 0.3)'
          } else {
            e.target.style.background = 'transparent'
            e.target.style.color = '#34d399'
          }
        }}
      >
        {isPending 
          ? (variant === 'navbar' ? 'Connecting...' : '🔄 Connecting...') 
          : (variant === 'navbar' ? 'Connect' : '💳 Connect Wallet')
        }
      </button>

      {/* Modal de connexion */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #065f46)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            maxWidth: '400px',
            width: '90%',
            border: '2px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            animation: 'modalSlideIn 0.3s ease',
            position: 'relative'
          }}>
            {/* Bouton de fermeture */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '1.5rem',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(148, 163, 184, 0.1)'
                e.target.style.color = '#f1f5f9'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.color = '#94a3b8'
              }}
            >
              ×
            </button>

            {/* Contenu de la modal */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                animation: 'float 2s ease-in-out infinite'
              }}>
                🌿
              </div>
              
              <h3 style={{ 
                color: '#34d399', 
                marginBottom: '0.5rem',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                Connect to FernBet
              </h3>
              
              <p style={{ 
                color: '#94a3b8', 
                marginBottom: '2rem',
                lineHeight: '1.6',
                fontSize: '0.95rem'
              }}>
                Connect your Coinbase Smart Wallet to start playing provably fair blockchain games
              </p>

              {/* Bouton de connexion principal */}
              <button
                onClick={handleConnect}
                disabled={isPending}
                style={{
                  background: isPending 
                    ? 'linear-gradient(135deg, #6b7280, #4b5563)' 
                    : 'linear-gradient(135deg, #0052ff, #0040c7)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isPending ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    Connect Smart Wallet
                  </>
                )}
              </button>

              {/* Avantages */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                color: '#93c5fd',
                textAlign: 'left'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#60a5fa' }}>
                  ✨ Smart Wallet Benefits:
                </div>
                <div>• No seed phrases to remember</div>
                <div>• Gas fees handled automatically</div>
                <div>• Email account recovery</div>
                <div>• Instant onboarding</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalSlideIn {
          0% {
            transform: scale(0.9) translateY(-20px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default SmartWalletConnect