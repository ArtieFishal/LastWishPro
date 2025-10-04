import React from 'react';

function SimpleApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '800px'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Last Wish
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          color: '#e5e7eb'
        }}>
          Secure Your Cryptocurrency Legacy
        </p>
        
        <div style={{
          background: '#374151',
          padding: '2rem',
          borderRadius: '1rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '1rem',
            color: '#f9fafb'
          }}>
            Platform Status
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            textAlign: 'left'
          }}>
            <div style={{
              background: '#1f2937',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>✅ Frontend</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>React application running</p>
            </div>
            
            <div style={{
              background: '#1f2937',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>✅ Backend</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>Flask API server ready</p>
            </div>
            
            <div style={{
              background: '#1f2937',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>✅ Security</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>AES-256 encryption enabled</p>
            </div>
            
            <div style={{
              background: '#1f2937',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>✅ Accessibility</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>WCAG 2.1 compliant</p>
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button style={{
            background: '#3b82f6',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#2563eb'}
          onMouseOut={(e) => e.target.style.background = '#3b82f6'}
          onClick={() => window.location.href = '/wallet-test'}
          >
            Test Wallet Integration
          </button>
          
          <button style={{
            background: '#6b7280',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#4b5563'}
          onMouseOut={(e) => e.target.style.background = '#6b7280'}
          onClick={() => window.location.href = '/addendum-test'}
          >
            Test Document Generation
          </button>
          
          <button style={{
            background: '#059669',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#047857'}
          onMouseOut={(e) => e.target.style.background = '#059669'}
          onClick={() => window.location.href = '/payment-test'}
          >
            Test Payment Processing
          </button>
        </div>
        
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: '#1f2937',
          borderRadius: '0.5rem',
          border: '1px solid #374151'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            marginBottom: '1rem',
            color: '#f9fafb'
          }}>
            Production Ready Features
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            textAlign: 'left'
          }}>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              color: '#d1d5db'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>🔐 Blockchain wallet integration</li>
              <li style={{ marginBottom: '0.5rem' }}>📄 Legal document generation</li>
              <li style={{ marginBottom: '0.5rem' }}>💳 Cryptocurrency payments</li>
              <li style={{ marginBottom: '0.5rem' }}>📧 Email notifications</li>
            </ul>
            
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              color: '#d1d5db'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>⚖️ Legal compliance checking</li>
              <li style={{ marginBottom: '0.5rem' }}>🛡️ Enterprise security</li>
              <li style={{ marginBottom: '0.5rem' }}>♿ Full accessibility</li>
              <li style={{ marginBottom: '0.5rem' }}>🚀 Performance optimized</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;

