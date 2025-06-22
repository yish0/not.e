# not.e

> **A hyper-customizable, developer-friendly note-taking app that combines the best of Slack, Notion, Obsidian, and VSCode.**

Enterprise-level note-taking application built with Electron + SvelteKit, designed for both developers and general users who want complete control over their note-taking workflow.

## 🚀 Vision

not.e aims to be the ultimate note-taking solution that bridges the gap between personal knowledge management and professional development workflows. Whether you're jotting down daily thoughts or managing complex project documentation, not.e adapts to your needs.

## ✨ Key Features

### 🏢 Workspace & Channel System

- **Multiple Workspaces**: Separate environments for different projects or contexts
- **Slack-like Channels**: Organize notes by topics, projects, or themes
- **Flexible Organization**: Each channel can contain different types of content

### 📝 Rich Content Types

- **Thread-style Notes**: GitHub Issue-inspired discussion format
- **Daily Notes**: Automatic daily note creation and management
- **Code Snippets**: Syntax highlighting and developer-friendly formatting
- **Custom Components**: Embed custom JavaScript and UI components

### 🔧 Developer-Centric Design

- **Git-Friendly**: All data stored as markdown files with frontmatter
- **Local-First**: Your data stays on your machine, with optional remote backup
- **Plugin System**: Extend functionality with custom plugins
- **Browser Integration**: Embed web content directly in your notes

### 🪟 Flexible Window Management

- **Three Window Modes**: Choose between normal, sidebar toggle, and standard toggle based on your workflow
- **Normal Mode**: Traditional desktop app behavior with no global toggle shortcuts
- **Sidebar Mode**: Fixed-width window (200-800px) that snaps to left/right screen edges for quick access
- **Standard Mode**: Center-screen window with cross-desktop support and traditional toggle behavior
- **Dynamic Shortcuts**: Keyboard shortcuts automatically adapt to your current window mode
- **Configuration API**: Complete programmatic control through IPC with frontend settings interface
- **Seamless Switching**: Change modes instantly via settings with automatic shortcut reconfiguration

### 🎨 Complete Customization

- **Custom Themes**: Style your workspace exactly how you want
- **Plugin Marketplace**: Share and discover community-created extensions
- **Programmable Interface**: Extend with custom JavaScript and components

## 🏗️ Architecture

### Data Storage

- **Vault-based**: Choose your own storage location (like Obsidian)
- **Markdown Files**: All notes stored as standard markdown with YAML frontmatter
- **Git Integration**: Version control through plugin system
- **Real-time Sync**: Automatic detection of external file changes

### Window Management System

- **Mode-Based Architecture**: Three distinct window modes (normal, sidebar toggle, standard toggle)
- **Dynamic Shortcuts**: Keyboard shortcuts generate automatically based on current mode configuration
- **Sidebar Positioning**: Configurable left/right positioning with adjustable width (200-800px)
- **Configuration Migration**: Automatic migration from legacy `enableCrossDesktopToggle` setting
- **IPC Communication**: Comprehensive API for window mode and toggle settings management
- **Platform Integration**: Native macOS window management with Mission Control and multi-monitor support

### File Structure

```
[Your Vault]/
├── .note/
│   ├── config.json
│   └── workspaces.json
├── workspace-personal/
│   ├── channel-daily/
│   │   ├── 2024-01-15.md
│   │   └── 2024-01-16.md
│   ├── channel-ideas/
│   └── .workspace.json
└── workspace-work/
```

### Thread Format Example

```markdown
---
title: 'API Design Discussion'
type: thread
created: 2024-01-15T10:00:00Z
tags: [api, design, backend]
---

# API Design Discussion

## Main Post

Should we go with RESTful API or GraphQL?

---

## Comment Thread

### Comment 1 (2024-01-15T10:30:00Z)

> RESTful API seems simpler...

### Comment 2 (2024-01-15T11:00:00Z)

> GraphQL offers more flexibility...
```

## 🛣️ Development Roadmap

### Phase 1: MVP (Foundation)

- [x] Basic Electron + SvelteKit setup
- [x] Window management system with three modes (normal, sidebar toggle, standard toggle)
- [x] Global shortcut system with dynamic mode-based configuration
- [x] Configuration management with automatic migration from legacy settings
- [x] IPC API for complete window mode and toggle settings control
- [x] Comprehensive unit test coverage for core systems
- [ ] Vault selection and management
- [ ] Basic text editing with markdown support
- [ ] Workspace and channel creation
- [ ] Daily notes functionality
- [ ] Local file storage with frontmatter

### Phase 2: Core Features

- [ ] Thread-style note creation and management
- [ ] Code snippet support with syntax highlighting
- [ ] Tag system and basic search
- [ ] Real-time file watching and conflict detection
- [ ] Export/import functionality
- [ ] Remote backup plugins (Git, cloud storage)

### Phase 3: Advanced Customization

- [ ] Custom JavaScript execution environment
- [ ] Plugin system architecture
- [ ] Browser embedding capabilities
- [ ] Community plugin marketplace
- [ ] Advanced theming system
- [ ] API for third-party integrations

## 🛠️ Tech Stack

- **Frontend**: SvelteKit + TypeScript
- **Desktop**: Electron
- **Styling**: Tailwind CSS + shadcn/ui
- **Storage**: Local markdown files with YAML frontmatter
- **Build Tool**: Bun
- **Linting**: ESLint + Prettier

## 🖥️ Platform Support

Currently, not.e is designed and tested exclusively for **macOS**. While future versions may support Windows and Linux, the current focus is on delivering the best possible experience for macOS users.

### System Requirements

- macOS 10.14 (Mojave) or later
- Node.js 18+
- Bun (recommended)

## 🚀 Getting Started

### Prerequisites

- macOS 10.14 (Mojave) or later
- Node.js 18+
- Bun (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yish0/not.e.git
cd not.e

# Install dependencies
bun install

# Start development server
bun run dev
```

### Build for Production

```bash
# Build the application
bun run build

# Package for distribution
bun run package
```

## 🧪 Development

### Available Scripts

- `bun run dev` - Start development servers (SvelteKit + Electron)
- `bun run build` - Build the application for production
- `bun run package` - Package the Electron application
- `bun run lint` - Check code formatting and linting
- `bun run lint:fix` - Fix formatting and linting issues
- `bun run typecheck` - Run TypeScript type checking

### Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Community

- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/yish0/not.e/issues)
- **Discussions**: Join conversations on [GitHub Discussions](https://github.com/yish0/not.e/discussions)

---

**Made with ❤️ by developers, for developers (and everyone else too!)**
