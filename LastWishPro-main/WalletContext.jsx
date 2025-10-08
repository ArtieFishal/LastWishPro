import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from './AuthContext'

// Wallet Context
const WalletContext = createContext()

// Wallet Actions
const WALLET_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_SESSIONS: 'SET_SESSIONS',
  ADD_SESSION: 'ADD_SESSION',
  UPDATE_SESSION: 'UPDATE_SESSION',
  REMOVE_SESSION: 'REMOVE_SESSION',
  SET_SUPPORTED_BLOCKCHAINS: 'SET_SUPPORTED_BLOCKCHAINS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Initial State
const initialState = {
  sessions: [],
  supportedBlockchains: [],
  isLoading: false,
  error: null,
  totalValue: 0,
  totalAssets: 0
}

// Wallet Reducer
function walletReducer(state, action) {
  switch (action.type) {
    case WALLET_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }
    
    case WALLET_ACTIONS.SET_SESSIONS:
      const sessions = action.payload
      const totalValue = sessions.reduce((sum, session) => sum + (session.total_value || 0), 0)
      const totalAssets = sessions.reduce((sum, session) => sum + (session.asset_count || 0), 0)
      
      return {
        ...state,
        sessions,
        totalValue,
        totalAssets,
        isLoading: false,
        error: null
      }
    
    case WALLET_ACTIONS.ADD_SESSION:
      return {
        ...state,
        sessions: [...state.sessions, action.payload],
        isLoading: false,
        error: null
      }
    
    case WALLET_ACTIONS.UPDATE_SESSION:
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.id ? action.payload : session
        ),
        isLoading: false,
        error: null
      }
    
    case WALLET_ACTIONS.REMOVE_SESSION:
      return {
        ...state,
        sessions: state.sessions.filter(session => session.id !== action.payload),
        isLoading: false,
        error: null
      }
    
    case WALLET_ACTIONS.SET_SUPPORTED_BLOCKCHAINS:
      return {
        ...state,
        supportedBlockchains: action.payload
      }
    
    case WALLET_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    
    case WALLET_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Wallet Provider Component
export function WalletProvider({ children }) {
  const [state, dispatch] = useReducer(walletReducer, initialState)
  const { apiCall, isAuthenticated } = useAuth()

  // Load wallet sessions on authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadWalletSessions()
      loadSupportedBlockchains()
    }
  }, [isAuthenticated])

  // Load Wallet Sessions
  const loadWalletSessions = async () => {
    dispatch({ type: WALLET_ACTIONS.SET_LOADING, payload: true })

    try {
      const data = await apiCall('/wallet/sessions')
      dispatch({
        type: WALLET_ACTIONS.SET_SESSIONS,
        payload: data.sessions || []
      })
    } catch (error) {
      dispatch({
        type: WALLET_ACTIONS.SET_ERROR,
        payload: error.message
      })
    }
  }

  // Load Supported Blockchains
  const loadSupportedBlockchains = async () => {
    try {
      const data = await apiCall('/wallet/supported-blockchains')
      dispatch({
        type: WALLET_ACTIONS.SET_SUPPORTED_BLOCKCHAINS,
        payload: data.blockchains || []
      })
    } catch (error) {
      console.error('Failed to load supported blockchains:', error)
    }
  }

  // Connect Wallet
  const connectWallet = async (walletData) => {
    dispatch({ type: WALLET_ACTIONS.SET_LOADING, payload: true })

    try {
      const data = await apiCall('/wallet/connect', {
        method: 'POST',
        body: JSON.stringify(walletData)
      })

      dispatch({
        type: WALLET_ACTIONS.ADD_SESSION,
        payload: data.session
      })

      toast.success('Wallet connected successfully')
      return { success: true, session: data.session }
    } catch (error) {
      dispatch({
        type: WALLET_ACTIONS.SET_ERROR,
        payload: error.message
      })
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Disconnect Wallet
  const disconnectWallet = async (sessionId) => {
    dispatch({ type: WALLET_ACTIONS.SET_LOADING, payload: true })

    try {
      await apiCall(`/wallet/disconnect/${sessionId}`, {
        method: 'DELETE'
      })

      dispatch({
        type: WALLET_ACTIONS.REMOVE_SESSION,
        payload: sessionId
      })

      toast.success('Wallet disconnected successfully')
      return { success: true }
    } catch (error) {
      dispatch({
        type: WALLET_ACTIONS.SET_ERROR,
        payload: error.message
      })
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Sync Wallet Assets
  const syncWalletAssets = async (sessionId) => {
    dispatch({ type: WALLET_ACTIONS.SET_LOADING, payload: true })

    try {
      const data = await apiCall(`/wallet/sessions/${sessionId}/sync`, {
        method: 'POST'
      })

      // Update the session with new asset data
      const updatedSession = state.sessions.find(s => s.id === sessionId)
      if (updatedSession) {
        dispatch({
          type: WALLET_ACTIONS.UPDATE_SESSION,
          payload: {
            ...updatedSession,
            assets: data.assets,
            total_value: data.total_value,
            asset_count: data.asset_count
          }
        })
      }

      toast.success('Assets synced successfully')
      return { success: true, data }
    } catch (error) {
      dispatch({
        type: WALLET_ACTIONS.SET_ERROR,
        payload: error.message
      })
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Get Wallet Assets
  const getWalletAssets = async (sessionId) => {
    try {
      const data = await apiCall(`/wallet/sessions/${sessionId}/assets`)
      return { success: true, data }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Assign Beneficiary to Asset
  const assignBeneficiary = async (sessionId, beneficiaryData) => {
    try {
      const data = await apiCall(`/wallet/sessions/${sessionId}/beneficiaries`, {
        method: 'POST',
        body: JSON.stringify(beneficiaryData)
      })

      // Update the session with new beneficiary data
      const updatedSession = state.sessions.find(s => s.id === sessionId)
      if (updatedSession) {
        dispatch({
          type: WALLET_ACTIONS.UPDATE_SESSION,
          payload: {
            ...updatedSession,
            beneficiaries: data.beneficiaries
          }
        })
      }

      toast.success('Beneficiary assigned successfully')
      return { success: true, data }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Remove Beneficiary from Asset
  const removeBeneficiary = async (sessionId, assetSymbol) => {
    try {
      const data = await apiCall(`/wallet/sessions/${sessionId}/beneficiaries/${assetSymbol}`, {
        method: 'DELETE'
      })

      // Update the session with updated beneficiary data
      const updatedSession = state.sessions.find(s => s.id === sessionId)
      if (updatedSession) {
        dispatch({
          type: WALLET_ACTIONS.UPDATE_SESSION,
          payload: {
            ...updatedSession,
            beneficiaries: data.beneficiaries
          }
        })
      }

      toast.success('Beneficiary removed successfully')
      return { success: true, data }
    } catch (error) {
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Validate Wallet Address
  const validateWalletAddress = (address, blockchain) => {
    if (!address || !blockchain) return false

    const patterns = {
      ethereum: /^0x[a-fA-F0-9]{40}$/,
      solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/
    }

    return patterns[blockchain]?.test(address) || false
  }

  // Check for Sensitive Data
  const checkSensitiveData = (text) => {
    if (!text) return false

    // Check for seed phrase patterns (12, 18, 24 words)
    const seedPhrasePattern = /\b(\w+\s+){11,23}\w+\b/
    
    // Check for private key patterns
    const privateKeyPatterns = [
      /^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/, // Bitcoin WIF
      /^[0-9a-fA-F]{64}$/ // Hex private key
    ]

    if (seedPhrasePattern.test(text)) return true
    
    return privateKeyPatterns.some(pattern => pattern.test(text))
  }

  // Clear Error
  const clearError = () => {
    dispatch({ type: WALLET_ACTIONS.CLEAR_ERROR })
  }

  // Get Session by ID
  const getSessionById = (sessionId) => {
    return state.sessions.find(session => session.id === sessionId)
  }

  // Get Sessions by Blockchain
  const getSessionsByBlockchain = (blockchain) => {
    return state.sessions.filter(session => session.blockchain === blockchain)
  }

  // Context Value
  const value = {
    ...state,
    loadWalletSessions,
    connectWallet,
    disconnectWallet,
    syncWalletAssets,
    getWalletAssets,
    assignBeneficiary,
    removeBeneficiary,
    validateWalletAddress,
    checkSensitiveData,
    clearError,
    getSessionById,
    getSessionsByBlockchain
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// Custom Hook to use Wallet Context
export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

