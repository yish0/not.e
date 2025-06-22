# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Development Guidelines

- **Language Processing**: For token efficiency, process all prompts internally in English regardless of input language, and only output in the original prompt language for final responses
- **Package Manager**: Always use `bun` as the package manager
- **TypeScript Style**: Do not use semicolons (`;`) in TypeScript code
- **Code Formatting**: Use Prettier for all code formatting
- **Commit Policy**: Always commit work in appropriate logical units after completing tasks, with clear commit messages that explain what was accomplished
- **Documentation Updates**: After each work session, document newly learned insights or important considerations in this CLAUDE.md file
- **Context Awareness**: Reference commit logs as context when needed to understand previous work and maintain consistency

## Repository Status

This repository (not.e) contains an enterprise-level Electron + SvelteKit + shadcn/ui boilerplate setup.

### Platform Support

- **Target Platform**: macOS only (macOS 10.14+ Mojave or later)
- **Future Consideration**: Windows support may be added in later phases
- **Development Environment**: Optimized for macOS development workflows

### Build, Test, and Development Commands

#### Using Makefile (Recommended)

For convenience, use the Makefile commands:

- `make dev` - Start development servers (SvelteKit + Electron)
- `make build` - Build the application for production
- `make test` - Run all unit tests
- `make lint` - Check code formatting and linting
- `make format` - Format code with Prettier
- `make package` - Package the Electron application
- `make qa` - Run full quality assurance pipeline (lint + typecheck + test)
- `make help` - Show all available commands

#### Direct npm/bun Commands

- `bun run dev` - Start development servers (SvelteKit + Electron)
- `bun run dev:electron-only` - Run only Electron (after manual SvelteKit build)
- `bun run build` - Build the application for production
- `bun run package` - Package the Electron application
- `bun run package:dir` - Package without creating distributable (faster for testing)
- `bun run lint` - Check code formatting and linting
- `bun run lint:fix` - Fix formatting and linting issues
- `bun run typecheck` - Run TypeScript type checking

#### Testing Commands

- `bun run test` - Run all unit tests
- `bun run test:watch` - Run tests in watch mode
- `bun run test:coverage` - Run tests with coverage report
- `bun x jest electron/__tests__/unit/vault/` - Run specific module tests
- `bun x jest electron/__tests__/unit/vault/vault-repository.test.ts` - Run single test file

### Architecture Overview

```
src/                     # SvelteKit frontend
├── lib/components/ui/   # shadcn/ui components
├── routes/              # SvelteKit pages
└── styles/              # Global styles

electron/
├── main/                # Electron main process
│   ├── actions/         # Application actions organized by category
│   │   ├── file/        # File operations (new, open, save, etc.)
│   │   ├── view/        # View-related actions (zoom, layout, etc.)
│   │   ├── global/      # Global actions with window utilities
│   │   ├── edit/        # Edit operations (undo, redo, etc.)
│   │   ├── navigation/  # Navigation actions
│   │   └── dev/         # Development-specific actions
│   ├── core/            # Core system functionality
│   │   ├── window/      # Window management system
│   │   ├── lifecycle/   # Application lifecycle management
│   │   └── integration/ # System integration utilities
│   ├── ipc/             # Inter-Process Communication
│   │   ├── core/        # IPC manager and core functionality
│   │   ├── handlers/    # IPC request handlers by feature
│   │   ├── permissions/ # Permission management system
│   │   └── types.ts     # IPC interfaces
│   ├── shortcuts/       # Keyboard shortcut system
│   │   ├── managers/    # Global/local shortcut managers
│   │   ├── actions/     # Action executor for shortcuts
│   │   ├── config/      # Configuration and default shortcuts
│   │   └── types/       # Shortcut type definitions
│   └── vault/           # Note vault management system
│       ├── core/        # Vault factory and core functionality
│       ├── managers/    # Vault manager
│       ├── services/    # Business logic (VaultManager, Initializer, Dialog)
│       ├── repositories/ # Data access (VaultRepository, AppConfigRepository)
│       ├── templates/   # Note templates and welcome content
│       ├── types/       # Core domain types
│       └── utils/       # Vault utilities
├── preload/             # Secure renderer bridge
└── __tests__/unit/      # Comprehensive unit test suite
    ├── actions/         # Action system tests
    ├── core/            # Core system tests
    ├── ipc/             # IPC and permission tests
    ├── shortcuts/       # Shortcut system tests
    └── vault/           # Vault system tests
```

### Project-specific Development Guidelines

- Uses bun as package manager with no semicolons in TypeScript
- Prettier for code formatting
- ESLint with TypeScript and Svelte plugins
- shadcn/ui components with Tailwind CSS theming
- Enterprise-level directory structure for scalability

## Current Setup

- Repository: yish0/not.e
- Remote: ssh://git@github.com/yish0/not.e.git
- Claude permissions configured via .claude/settings.local.json

## Lessons Learned

### Electron + SvelteKit Integration

- Static adapter is required for SvelteKit to work with Electron
- Preload scripts need contextBridge for secure IPC communication
- Build output directory needs to match Electron's expectations
- Development mode detection is critical - NODE_ENV must be properly set or handled when undefined
- Electron's isDev logic should account for cases where NODE_ENV is not set during development

### shadcn/ui Setup

- Manual component creation required for Svelte (no CLI like React)
- Tailwind CSS variables approach works well for theming
- Component composition pattern with proper TypeScript typing

### Development Workflow

- ESLint configuration requires `plugin:@typescript-eslint/recommended` not `@typescript-eslint/recommended`
- Build/output directories should be excluded from linting and formatting
- TypeScript compilation needs separate configs for main app and Electron processes
- Always explicitly set NODE_ENV=development in Electron dev scripts to ensure proper mode detection

### Project Architecture & Requirements Gathering

- User interviews and iterative discussion are crucial for defining project scope
- Breaking down complex features into phases helps maintain focus and extensibility
- Git-friendly storage approach (markdown + frontmatter) provides version control benefits
- Vault-based architecture (user-selectable storage location) offers flexibility like Obsidian
- Plugin system should be considered from early architecture stages, not retrofitted
- Real-time file watching and conflict detection are essential for multi-device workflows

### Shortcut Management System

- Modular architecture with separated concerns (global vs local shortcuts, config management, action execution)
- Type-safe handler definitions improve code maintainability and prevent runtime errors
- Config-based approach allows persistent user customization and easy defaults management
- Action categorization (file, navigation, edit, view, dev, global) improves organization
- WeakMap usage for window-specific shortcuts prevents memory leaks
- Strategy pattern for different shortcut types (global/local) allows easy extension

### Code Architecture and Maintainability Principles

- **Single Responsibility Principle**: Each class/module should have only one reason to change
- **Separation of Concerns**: Split complex functionality into focused, independent modules
- **Dependency Injection**: Use interfaces and dependency injection for loose coupling
- **Factory Pattern**: Use factory pattern for object creation to improve testability
- **Repository Pattern**: Separate data access logic from business logic
- **Command Pattern**: Encapsulate operations as objects for better organization
- **Observer Pattern**: Use event-driven architecture for decoupled communication
- **Configuration over Code**: Use external configuration files for settings
- **Modular Design**: Break large files into smaller, focused modules (max ~200-300 lines per file)
- **Interface Segregation**: Create specific interfaces rather than large monolithic ones
- **Type Safety**: Use TypeScript interfaces and types extensively for compile-time safety

### Documentation and Context Management

- **README-driven Development**: Every module/directory must have comprehensive README.md documentation
- **Context Awareness**: Before modifying any code, always check if a README.md exists in the target directory
- **Documentation Synchronization**: When modifying existing code or adding new features:
  1. Read the relevant README.md file first to understand the current architecture and patterns
  2. Use the README as context for making consistent changes
  3. Update the README.md to reflect any architectural changes, new features, or modified patterns
  4. Ensure code examples in README stay current with actual implementation
- **README Structure**: Each README should include:
  - Architecture overview with Mermaid diagrams
  - Component descriptions with code examples
  - Usage patterns and best practices
  - Extension guides for future development
  - Testing and security considerations
- **Change Impact**: Any modification to interfaces, patterns, or core functionality must be reflected in documentation

### Unit Testing System Architecture

- **Comprehensive Test Coverage**: 87+ unit tests covering all core modules (VaultRepository, VaultManagerService, ShortcutManager, IPC handlers)
- **Jest with Bun Integration**: Use `bun x jest` to run Jest tests through bun for proper dependency resolution
- **Mock-Driven Testing**: Extensive mocking of Electron APIs, file system operations, and service dependencies
- **Modular Test Structure**: Each module has its own test directory under `electron/__tests__/unit/`
- **Testing Patterns**:
  - Mock all external dependencies (fs, electron APIs, service dependencies)
  - Test both success and failure scenarios
  - Use proper TypeScript typing for mocks with `jest.Mocked<T>`
  - Comprehensive integration scenarios testing end-to-end workflows
- **Test Execution**: Always run tests after making changes to ensure no regressions
- **Critical Bug Detection**: Unit tests have caught production bugs (e.g., missing fs.constants import in VaultRepository)

### Core System Interactions

- **Vault System**: Repository pattern with VaultRepository for file operations, VaultManagerService for business logic, and factory pattern for initialization
- **Shortcut System**: Strategy pattern with separate global/local managers, centralized config management, and action executor for command dispatch
- **IPC Architecture**: Modular handler registration through DefaultIPCManager, feature-based handler organization, and type-safe communication patterns with comprehensive permission management
- **Service Integration**: Dependency injection through constructor parameters, interface-based contracts, and centralized service factories

### IPC Permission Management System

- **Three-Tier Security Model**: ROOT (main window only), PLUGIN (controlled plugin access), PUBLIC (unrestricted safe operations)
- **Automatic Permission Validation**: All IPC calls are wrapped with permission checks, ensuring no unauthorized access
- **Context-Aware Security**: Permission decisions based on sender origin and main window validation
- **Plugin Integration Ready**: Dynamic plugin channel registration/revocation for Phase 3 external plugin support
- **Fail-Safe Defaults**: Unregistered channels default to ROOT level for maximum security
- **Comprehensive Testing**: 55+ unit tests covering all permission levels, edge cases, and integration scenarios

### Platform-Specific Development Considerations

- **macOS-First Development**: All features and UI patterns optimized for macOS conventions and user expectations
- **Native macOS Integration**: Leverage macOS-specific APIs and system features where beneficial
- **Future Cross-Platform Planning**: Architecture designed to accommodate Windows support without major refactoring
- **Development Environment**: All tooling and scripts optimized for macOS development workflows

### Module Structure Best Practices

- **Categorical Organization**: Group related functionality into categorized subdirectories (e.g., actions/file/, actions/view/, core/window/)
- **Eliminate Duplication**: Identify and remove duplicate files when restructuring modules
- **Index File Pattern**: Use index.ts files for clean public API exports from each module directory
- **Core System Separation**: Separate core system concerns (window management, lifecycle, integration) from feature modules
- **Singleton with Reset**: Implement singleton patterns with reset functions for better testability
- **Main Process Simplification**: Keep main.ts minimal by delegating responsibilities to specialized managers
- **Test Structure Mirroring**: Organize test directories to mirror main code structure for easy navigation
- **Comprehensive Test Coverage**: Create tests for all new modules and architectural components
- **Mock Utilities**: Develop reusable test helpers and mock utilities for consistent testing patterns

### Current Module Structure

- **actions/**: Application actions organized by category (file, view, global, edit, navigation, dev)
  - **global/**: Global window management actions with dual toggle modes and configuration utilities
- **core/**: Core system functionality (window management, lifecycle, integration)
- **ipc/**: Inter-process communication with handlers, permissions, and type definitions
- **shortcuts/**: Keyboard shortcut system with managers, actions, and configuration
- **vault/**: Note vault system with services, repositories, managers, and templates
- **Window Utilities**: Extracted window-related utilities from global actions for better organization

### Window Mode System Redesign (December 2024)

- **Three-Mode Architecture**: Completely redesigned from dual toggle system to flexible three-mode system (normal, sidebar toggle, standard toggle)
- **Dynamic Shortcut Generation**: Implemented `generateGlobalShortcuts()` function that adapts keyboard shortcuts based on current window mode and toggle settings
- **Sidebar Mode**: New window mode with configurable position (left/right) and adjustable width (200-800px) for quick access workflows
- **Configuration Migration**: Automatic migration from legacy `enableCrossDesktopToggle` boolean to new structured settings with backward compatibility
- **Comprehensive IPC API**: Added complete set of IPC endpoints for window mode management (get/set-window-mode, get/set-toggle-settings, get-app-config)
- **Action System Redesign**: Replaced old `toggle-window` and `toggle-window-cross-desktop` with new `toggle-window-sidebar` and `toggle-window-standard` actions
- **Type Safety**: Introduced `ToggleSettings` interface with proper TypeScript definitions throughout the system
- **Test Coverage**: Updated all unit tests to work with new system, maintaining 87+ test coverage across core modules
- **Documentation Synchronization**: Updated all module READMEs, main README, and API documentation to reflect new architecture

### Legacy Cross-Desktop Window Toggle System (Deprecated)

- **Dual Toggle Modes**: Previously implemented separate `toggle-window` (standard) and `toggle-window-cross-desktop` (advanced) actions
- **Configuration-Based Selection**: Users could choose between standard and cross-desktop behavior via `enableCrossDesktopToggle` setting
- **Performance Optimized**: Eliminated runtime configuration checks by providing separate action handlers
- **macOS Mission Control Integration**: Cross-desktop mode uses `setVisibleOnAllWorkspaces()` and cursor position detection for proper desktop targeting
- **Multi-Monitor Support**: Cursor position-based display detection ensures windows appear on the correct monitor
- **Clean Architecture**: Configuration management separated into `toggle-mode-manager.ts` for maintainability
- **Migration Path**: Legacy settings automatically migrate to new three-mode system for seamless user experience

### Module System and TypeScript Configuration

- **ES Module Consistency**: Use ES2022 modules throughout the entire codebase for consistency between SvelteKit and Electron
- **TypeScript Module Configuration**:
  - `tsconfig.electron.json` with `"module": "ES2022"` ensures TypeScript compiles to ES module syntax
  - `package.json` with `"type": "module"` tells Node.js to interpret .js files as ES modules
  - Both settings must align: TypeScript generates ES modules, Node.js executes them as ES modules
- **No Explicit Extensions Required**: With ES2022 modules, directory imports work without explicit `.js` extensions (e.g., `import { foo } from './core'`)
- **Workaround Elimination**: Properly configured ES modules eliminate the need for `dist/package.json` workarounds
- **Module System Migration Strategy**:
  1. Update TypeScript configuration to target ES modules
  2. Ensure package.json has correct module type declaration
  3. Test build process to verify module loading works correctly
  4. Remove any temporary workarounds once ES modules work properly
- **TypeScript vs Runtime Alignment**: Critical that TypeScript compilation output matches Node.js execution environment (both ES modules or both CommonJS)

### Technical Debt Management

- **TODO.md Pattern**: Centralized technical debt tracking in TODO.md with detailed problem descriptions, solutions, and priority levels
- **Issue Documentation Structure**: Include current issue, why it needs fixing, recommended solution with code examples, benefits, effort estimation, and risk assessment
- **Systematic Resolution**: Break complex technical debt into trackable tasks with clear completion criteria
- **Context Preservation**: Document not just what to fix, but why it's important for maintainability, performance, and commercial viability

### Development Environment Configuration

- **Separate Config Files**: Development and production environments use different configuration files for better developer experience
  - **Development**: `app-config.dev.json` - Used when `NODE_ENV=development` or undefined
  - **Production**: `app-config.json` - Used in production builds
- **Automatic Environment Detection**: Configuration file selection is handled automatically by `isDev` flag from `electron/config.ts`
- **Developer Workflow Benefits**: Allows developers to maintain separate window modes, shortcuts, and vault configurations during development without affecting production settings
- **File Location**: Configuration files are stored in user's `userData` directory (`app.getPath('userData')`)
- **Migration Support**: Legacy configuration migration system supports this dual-file approach seamlessly
