# Contributing to EasyGraph 🎉

First off, thank you for considering contributing to EasyGraph! It's people like you that make EasyGraph such a great tool. We welcome contributions from everyone, whether you're a seasoned developer or just getting started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Contributing Code](#contributing-code)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by respect and inclusivity. By participating, you are expected to uphold this standard. Please be kind, respectful, and professional in all interactions.

---

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Bugs are tracked as GitHub issues. When creating a bug report, please include:

- **Clear title and description** - Be specific about what happened
- **Steps to reproduce** - Detailed steps to recreate the issue
- **Expected behavior** - What you expected to happen
- **Actual behavior** - What actually happened
- **Screenshots** - If applicable
- **Environment details** - OS, Node version, browser, etc.

**Example:**
```
Title: Chart rendering fails with CSV files larger than 10MB

Description: When uploading a CSV file larger than 10MB, the application 
crashes with a "Memory exceeded" error.

Steps to reproduce:
1. Navigate to the dashboard
2. Click "Upload Data"
3. Select a CSV file > 10MB
4. Click "Generate Chart"

Expected: Chart should render or show a size warning
Actual: Application crashes
Environment: Windows 11, Node v18.0.0, Chrome 120
```

### 💡 Suggesting Features

We love new ideas! When suggesting a feature:

- **Use a clear, descriptive title**
- **Provide a detailed description** of the suggested feature
- **Explain why this feature would be useful** to most users
- **Include mockups or examples** if applicable

### 💻 Contributing Code

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages** (`git commit -m 'Add amazing feature'`)
6. **Push to your fork** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

---

## 🛠️ Development Setup

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- Gemini API Key ([Get one here](https://ai.google.dev/))

### Setup Steps

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/easygraph.git
   cd easygraph
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app runs on http://localhost:8007

5. **Make your changes and test**

---

## 🔄 Pull Request Process

1. **Update documentation** - If you're adding features, update the README
2. **Follow the style guide** - Keep code consistent with existing patterns
3. **Test your changes** - Ensure everything works as expected
4. **Write clear commit messages** - Use present tense ("Add feature" not "Added feature")
5. **Reference issues** - If your PR fixes an issue, mention it (`Fixes #123`)
6. **Be patient and responsive** - Maintainers may request changes

### PR Title Format

- `feat: Add dark mode toggle button`
- `fix: Resolve CSV parsing error for large files`
- `docs: Update installation instructions`
- `refactor: Simplify chart rendering logic`
- `test: Add unit tests for data parser`

---

## 🎨 Style Guidelines

### Code Style

- **Format**: Use consistent indentation (2 spaces)
- **ES6+**: Use modern JavaScript features
- **Comments**: Write clear comments for complex logic
- **Naming**: Use descriptive variable and function names
  - `camelCase` for variables and functions
  - `PascalCase` for React components
  - `UPPER_CASE` for constants

### React Best Practices

- Use functional components with hooks
- Keep components small and focused
- Avoid prop drilling - use context when needed
- Use meaningful component and prop names

### Example

```javascript
// ✅ Good
const calculateChartDimensions = (data, containerWidth) => {
  const aspectRatio = 16 / 9;
  return {
    width: containerWidth,
    height: containerWidth / aspectRatio
  };
};

// ❌ Avoid
const calc = (d, w) => {
  return { width: w, height: w / 1.78 };
};
```

---

## 🧪 Testing

Before submitting a PR:

1. **Manual testing** - Test your changes in the browser
2. **Different data formats** - Try CSV, TXT, and edge cases
3. **Browser compatibility** - Test in Chrome, Firefox, Safari
4. **Responsive design** - Check mobile and desktop views
5. **Dark mode** - Ensure features work in both themes

---

## 📚 Project Structure

```
easygraph/
├── src/
│   ├── components/     # React components
│   ├── utils/          # Helper functions
│   ├── hooks/          # Custom React hooks
│   └── styles/         # CSS files
├── public/             # Static assets
├── .env.local          # Environment variables (not committed)
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies and scripts
```

---

## 🌟 Community

- **Be respectful** - Everyone was a beginner once
- **Be helpful** - Share knowledge and help others
- **Be collaborative** - We're building this together
- **Have fun!** - Enjoy the process of creating something awesome

---

## 📞 Questions?

If you have questions about contributing:

- Open a [GitHub Discussion](../../discussions)
- Check existing issues and PRs
- Reach out to the maintainers

---

## 🙏 Thank You!

Every contribution, no matter how small, makes a difference. Thank you for being part of the EasyGraph community!

**Happy Coding! 🚀**

---

*This contributing guide is inspired by open source best practices and is subject to updates as the project evolves.*
