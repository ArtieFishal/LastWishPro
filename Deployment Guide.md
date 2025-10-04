# Deployment Guide

This guide covers various deployment options for the Crypto Wallet Connect Models application.

## 🚀 Quick Deploy Options

### GitHub Pages (Recommended)

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/crypto-wallet-matrix.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as the source
   - The workflow will automatically deploy on push to main

3. **Access your site**:
   - Your site will be available at: `https://yourusername.github.io/crypto-wallet-matrix/`

### Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Or connect your GitHub repo** at [vercel.com](https://vercel.com)

### Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `/out` folder** to Netlify:
   - Drag and drop the `/out` folder to [netlify.com/drop](https://netlify.com/drop)
   - Or connect your GitHub repo at [netlify.com](https://netlify.com)

### Static Hosting Services

The application builds to static files in the `/out` directory, making it compatible with:

- **AWS S3 + CloudFront**
- **Google Cloud Storage**
- **Azure Static Web Apps**
- **Firebase Hosting**
- **Surge.sh**
- **Render**

## 🛠 Build Configuration

### Static Export Settings

The project is configured for static export in `next.config.js`:

```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

### Build Commands

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build and export static files
npm run start        # Start production server (for testing)
npm run lint         # Run ESLint
```

## 🔧 Environment Configuration

### No Environment Variables Required

The application runs entirely client-side with no backend dependencies or environment variables required.

### Custom Domain Setup

For custom domains, add a `CNAME` file to the `/public` directory:

```bash
echo "yourdomain.com" > public/CNAME
```

## 📊 Performance Optimization

### Build Optimization

The application is optimized for:
- **Static Generation**: All pages are pre-rendered
- **Tree Shaking**: Unused code is eliminated
- **Code Splitting**: Automatic code splitting by Next.js
- **Asset Optimization**: Images and assets are optimized

### Lighthouse Scores

Expected performance metrics:
- **Performance**: 95+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+

## 🔍 Troubleshooting

### Common Issues

1. **Blank Page on Deployment**:
   - Ensure `output: 'export'` is set in `next.config.js`
   - Check that all imports are client-side compatible
   - Verify the build completes without errors

2. **404 Errors**:
   - Ensure `trailingSlash: true` is set
   - Check that routing is configured correctly for your hosting provider

3. **Asset Loading Issues**:
   - Verify `images: { unoptimized: true }` is set
   - Check that asset paths are relative

### Build Verification

Before deploying, always verify:

```bash
# Clean build
rm -rf .next out
npm run build

# Test locally
npx serve out
```

## 🚀 CI/CD Pipeline

### GitHub Actions

The included workflow (`.github/workflows/deploy.yml`) automatically:
- Installs dependencies
- Runs linting
- Builds the application
- Deploys to GitHub Pages

### Custom CI/CD

For other CI/CD systems, use these commands:

```bash
# Install
npm ci

# Lint
npm run lint

# Build
npm run build

# Deploy the /out directory
```

## 📱 Mobile Optimization

The application is fully responsive and optimized for:
- **Mobile devices** (320px+)
- **Tablets** (768px+)
- **Desktop** (1024px+)
- **Large screens** (1440px+)

## 🔒 Security Considerations

- **No server-side code**: Eliminates server vulnerabilities
- **Static hosting**: Reduced attack surface
- **HTTPS**: Always use HTTPS in production
- **CSP Headers**: Consider adding Content Security Policy headers

## 📈 Analytics Integration

To add analytics, include tracking scripts in `src/app/layout.tsx`:

```tsx
// Google Analytics example
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

## 🎯 Production Checklist

Before deploying to production:

- [ ] Run `npm run build` successfully
- [ ] Test the built application locally
- [ ] Verify all features work correctly
- [ ] Check responsive design on multiple devices
- [ ] Test dark/light mode toggle
- [ ] Verify all links and navigation work
- [ ] Run accessibility tests
- [ ] Check performance with Lighthouse
- [ ] Test on different browsers
- [ ] Verify SEO meta tags are correct

## 📞 Support

For deployment issues:
- Check the [GitHub Issues](https://github.com/yourusername/crypto-wallet-matrix/issues)
- Review the [Contributing Guide](CONTRIBUTING.md)
- Consult the hosting provider's documentation

