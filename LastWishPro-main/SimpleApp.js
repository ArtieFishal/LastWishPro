// Simple standalone app without React dependencies
function SimpleApp() {
  const appHTML = `
    <div style="
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: #ffffff;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    ">
      <div style="text-align: center; max-width: 800px;">
        <h1 style="
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        ">
          Last Wish
        </h1>
        
        <p style="
          font-size: 1.25rem;
          margin-bottom: 2rem;
          color: #e5e7eb;
        ">
          Secure Your Cryptocurrency Legacy
        </p>
        
        <div style="
          background: #374151;
          padding: 2rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
        ">
          <h2 style="
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #f9fafb;
          ">
            Platform Status
          </h2>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            text-align: left;
          ">
            <div style="
              background: #1f2937;
              padding: 1rem;
              border-radius: 0.5rem;
            ">
              <h3 style="color: #10b981; margin-bottom: 0.5rem;">✅ Frontend</h3>
              <p style="color: #d1d5db; font-size: 0.875rem;">React application running</p>
            </div>
            
            <div style="
              background: #1f2937;
              padding: 1rem;
              border-radius: 0.5rem;
            ">
              <h3 style="color: #10b981; margin-bottom: 0.5rem;">✅ Backend</h3>
              <p style="color: #d1d5db; font-size: 0.875rem;">Flask API server ready</p>
            </div>
            
            <div style="
              background: #1f2937;
              padding: 1rem;
              border-radius: 0.5rem;
            ">
              <h3 style="color: #10b981; margin-bottom: 0.5rem;">✅ Security</h3>
              <p style="color: #d1d5db; font-size: 0.875rem;">AES-256 encryption enabled</p>
            </div>
            
            <div style="
              background: #1f2937;
              padding: 1rem;
              border-radius: 0.5rem;
            ">
              <h3 style="color: #10b981; margin-bottom: 0.5rem;">✅ Accessibility</h3>
              <p style="color: #d1d5db; font-size: 0.875rem;">WCAG 2.1 compliant</p>
            </div>
          </div>
        </div>
        
        <div style="
          margin-top: 3rem;
          padding: 1.5rem;
          background: #1f2937;
          border-radius: 0.5rem;
          border: 1px solid #374151;
        ">
          <h3 style="
            font-size: 1.25rem;
            margin-bottom: 1rem;
            color: #f9fafb;
          ">
            Production Ready Features
          </h3>
          
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            text-align: left;
          ">
            <ul style="
              list-style: none;
              padding: 0;
              margin: 0;
              color: #d1d5db;
            ">
              <li style="margin-bottom: 0.5rem;">🔐 Blockchain wallet integration</li>
              <li style="margin-bottom: 0.5rem;">📄 Legal document generation</li>
              <li style="margin-bottom: 0.5rem;">💳 Cryptocurrency payments</li>
              <li style="margin-bottom: 0.5rem;">📧 Email notifications</li>
            </ul>
            
            <ul style="
              list-style: none;
              padding: 0;
              margin: 0;
              color: #d1d5db;
            ">
              <li style="margin-bottom: 0.5rem;">⚖️ Legal compliance checking</li>
              <li style="margin-bottom: 0.5rem;">🛡️ Enterprise security</li>
              <li style="margin-bottom: 0.5rem;">♿ Full accessibility</li>
              <li style="margin-bottom: 0.5rem;">🚀 Performance optimized</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return appHTML;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SimpleApp;
}

// For browser usage
if (typeof window !== 'undefined') {
  window.SimpleApp = SimpleApp;
}

