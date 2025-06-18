import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useCHIPBalance } from '../hooks/useCHIPToken'
import { useCasinoBank } from '../hooks/useCasinoBank'

const CHIPBalance = () => {
  const { isConnected } = useAccount()
  const { balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useCHIPBalance()
  const casinoBank = useCasinoBank()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('0.1')
  const [withdrawAmount, setWithdrawAmount] = useState('10')

  // Deposit hooks
  const { deposit, isPending: isDepositing, isConfirming: isDepositConfirming, isSuccess: isDepositSuccess } = casinoBank.useDepositETH()
  
  // Withdraw hooks
  const { cashout, isPending: isWithdrawing, isConfirming: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = casinoBank.useCashoutCHIP()
  
  // Free chips hooks
  const { claimFreeChips, isPending: isClaiming, canClaim } = casinoBank.useClaimFreeChips()

  // Calculate CHIP value for deposit
  const chipValueForDeposit = casinoBank.useGetChipValueForETH(depositAmount)
  
  // Calculate ETH value for withdraw
  const ethValueForWithdraw = casinoBank.useGetETHValueForChip(withdrawAmount)

  const handleDeposit = async () => {
    await deposit(depositAmount)
    if (isDepositSuccess) {
      setShowDepositModal(false)
      refetchBalance()
    }
  }

  const handleWithdraw = async () => {
    await cashout(withdrawAmount)
    if (isWithdrawSuccess) {
      setShowWithdrawModal(false)
      refetchBalance()
    }
  }

  const handleClaimFreeChips = async () => {
    await claimFreeChips()
    refetchBalance()
  }

  if (!isConnected) return null

  return (
    <>
      {/* Balance Display */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '1rem',
        padding: '1rem',
        marginBottom: '1rem',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>CHIP Balance</span>
          <span style={{ 
            color: '#34d399', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            {isLoadingBalance ? '...' : parseFloat(balance).toFixed(2)} CHIP
          </span>
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowDepositModal(true)}
            style={{
              flex: 1,
              background: '#10b981',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            Deposit
          </button>
          
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={parseFloat(balance) === 0}
            style={{
              flex: 1,
              background: parseFloat(balance) === 0 ? '#6b7280' : '#f59e0b',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: parseFloat(balance) === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            Withdraw
          </button>
          
          {canClaim && (
            <button
              onClick={handleClaimFreeChips}
              disabled={isClaiming}
              style={{
                flex: 1,
                background: '#8b5cf6',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              {isClaiming ? 'Claiming...' : 'Free 5 CHIP'}
            </button>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            padding: '2rem',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '400px',
            color: 'white'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#34d399' }}>Deposit ETH for CHIP</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
                ETH Amount
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="0.01"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{
              background: 'rgba(52, 211, 153, 0.1)',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, color: '#34d399' }}>
                You will receive: <strong>{chipValueForDeposit} CHIP</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleDeposit}
                disabled={isDepositing || isDepositConfirming}
                style={{
                  flex: 1,
                  background: '#10b981',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {isDepositing || isDepositConfirming ? 'Processing...' : 'Deposit'}
              </button>
              
              <button
                onClick={() => setShowDepositModal(false)}
                style={{
                  flex: 1,
                  background: '#6b7280',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            padding: '2rem',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '400px',
            color: 'white'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#f59e0b' }}>Withdraw CHIP for ETH</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
                CHIP Amount (Max: {balance})
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="1"
                max={balance}
                step="1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, color: '#f59e0b' }}>
                You will receive: <strong>{ethValueForWithdraw} ETH</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || isWithdrawConfirming}
                style={{
                  flex: 1,
                  background: '#f59e0b',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {isWithdrawing || isWithdrawConfirming ? 'Processing...' : 'Withdraw'}
              </button>
              
              <button
                onClick={() => setShowWithdrawModal(false)}
                style={{
                  flex: 1,
                  background: '#6b7280',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CHIPBalance