# Contributing to Crypto Wallet Connect Models

Thank you for your interest in contributing to the Crypto Wallet Connect Models project! We welcome contributions from the community.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/crypto-wallet-matrix.git
   cd crypto-wallet-matrix
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic

### Component Structure
- Place UI components in `src/components/ui/`
- Use the existing component patterns
- Ensure components are responsive and accessible

### Data Management
- Wallet data should be added to `src/data/wallets.ts`
- Follow the existing `WalletData` interface structure
- Ensure all required fields are populated

## 📝 Types of Contributions

### 🔍 Adding New Wallets
When adding a new wallet, please include:
- Accurate wallet information (name, type, supported blockchains)
- Current user base statistics
- Supported protocols and connection methods
- Official website URL
- Key features and capabilities

### 🌐 Adding New Blockchains
For new blockchain support:
- Add blockchain configuration to the `blockchains` object
- Include popular dApps for the ecosystem
- Specify supported wallet connection protocols
- Add appropriate blockchain icon/symbol

### 🐛 Bug Fixes
- Describe the bug clearly in your PR
- Include steps to reproduce if applicable
- Test your fix thoroughly

### ✨ Feature Enhancements
- Discuss major features in an issue first
- Ensure new features align with the project goals
- Include appropriate tests and documentation

## 🧪 Testing

Before submitting your contribution:

1. **Test locally**:
   ```bash
   npm run dev
   ```

2. **Build successfully**:
   ```bash
   npm run build
   ```

3. **Lint your code**:
   ```bash
   npm run lint
   ```

4. **Test all functionality**:
   - Wallet comparison and filtering
   - Multi-chain connections
   - dApp integrations
   - Responsive design

## 📋 Pull Request Process

1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Create a clear PR description** including:
   - What changes were made
   - Why the changes were necessary
   - Any breaking changes
   - Screenshots for UI changes

4. **Link related issues** if applicable
5. **Request review** from maintainers

## 📊 Wallet Data Guidelines

When adding or updating wallet information:

### Required Fields
- `name`: Official wallet name
- `type`: Array of wallet types (e.g., "Browser Extension", "Mobile App")
- `blockchains`: Array of supported blockchain networks
- `userBase`: Current user base with appropriate suffix (e.g., "10M+")
- `openSource`: Boolean indicating if the wallet is open source
- `protocols`: Array of supported connection protocols
- `description`: Brief, accurate description
- `website`: Official website URL
- `features`: Array of key wallet features

### Data Accuracy
- Use official sources for user base statistics
- Verify supported blockchains and protocols
- Ensure website URLs are current and official
- Double-check open source status

## 🎨 UI/UX Guidelines

- Maintain consistency with existing design patterns
- Ensure accessibility (proper contrast, keyboard navigation)
- Test on both desktop and mobile devices
- Follow responsive design principles
- Use existing color schemes and typography

## 🔧 Technical Requirements

- **Node.js**: Version 18 or higher
- **TypeScript**: Use strict typing
- **Next.js**: Follow App Router patterns
- **Tailwind CSS**: Use utility classes consistently
- **ESLint**: Fix all linting errors

## 📞 Getting Help

If you need help or have questions:

1. **Check existing issues** for similar questions
2. **Create a new issue** with detailed information
3. **Join discussions** in existing issues
4. **Review the documentation** thoroughly

## 🏆 Recognition

Contributors will be recognized in:
- Project README
- Release notes for significant contributions
- GitHub contributor statistics

## 📜 Code of Conduct

Please note that this project follows a Code of Conduct. By participating, you agree to abide by its terms:

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment
- Report inappropriate behavior

## 🚀 Release Process

1. Changes are reviewed and merged to `main`
2. Releases are tagged with semantic versioning
3. Release notes highlight new features and changes
4. Documentation is updated accordingly

Thank you for contributing to the crypto wallet ecosystem! 🙏

