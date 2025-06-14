import React from 'react'

const Card = ({ cardIndex, isHidden = false, className = '', ...props }) => {
  // Fonction pour convertir l'index de carte en affichage
  const formatCard = (index) => {
    const suits = ['♠️', '♥️', '♦️', '♣️']
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    
    const suit = suits[Math.floor(index / 13)]
    const rank = ranks[index % 13]
    
    return { rank, suit, display: `${rank}${suit}` }
  }

  if (isHidden) {
    return (
      <div 
        className={`card-hidden ${className}`}
        style={{
          background: 'linear-gradient(145deg, #1e3a8a, #1e40af)',
          border: '2px solid #3b82f6',
          padding: '1rem 0.75rem',
          borderRadius: '0.5rem',
          fontSize: '1.5rem',
          minWidth: '60px',
          height: '90px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          animation: 'cardPulse 2s ease-in-out infinite',
          ...props.style
        }}
        {...props}
      >
        🂠
      </div>
    )
  }

  const formattedCard = formatCard(cardIndex)
  
  return (
    <div 
      className={`playing-card ${className}`}
      style={{
        background: 'white',
        color: formattedCard.suit === '♥️' || formattedCard.suit === '♦️' ? '#ef4444' : '#1f2937',
        padding: '1rem 0.75rem',
        borderRadius: '0.5rem',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        minWidth: '60px',
        height: '90px',
        textAlign: 'center',
        boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s ease',
        cursor: 'pointer',
        ...props.style
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-5px) rotateY(10deg)'
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0) rotateY(0deg)'
      }}
      {...props}
    >
      {formattedCard.display}
    </div>
  )
}

export default Card