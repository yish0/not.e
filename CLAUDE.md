# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 토큰 사용 최소화를 위해서 어떤 언어로 프롬프트를 입력해도 내부에서는 영어로 처리하고 최종 출력만 프롬프트에 사용된 언어로 출력해.
- 패키지매니저는 언제나 bun을 사용해주고, typescript에서는 ;(세미콜론)은 사용하지 않는 방침으로 해줘.
- formatter는 prettier를 사용해
- 작업이 완료된 후에는 항상 적절한 작업단위로 commit을 하고, 나중에 commit log로부터 너가 무었을 했는지 알기쉽게 commit메세지를 작성해줘.
- 항상 작업이 완료된 후에는 너가 이번작업을 통해 새롭게 배운내용이나 주의할 점을 CLAUDE.md에 기록해둬.
- commit로그에 너가 어떤작업을 했는지가 모두 기록되어있으니까 컨텍스트로써 commit로그그의 참고가 필요한 경우엔 참고해서 명령을 이행하도록해.

## Repository Status

This repository (not.e) contains an enterprise-level Electron + SvelteKit + shadcn/ui boilerplate setup.

### Build, Test, and Development Commands

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
│   ├── vault/           # Note vault management system
│   │   ├── services/    # Business logic (VaultManager, Initializer, Dialog)
│   │   ├── repositories/ # Data access (VaultRepository, AppConfigRepository)
│   │   └── interfaces.ts # Core domain types
│   ├── shortcuts/       # Global/local shortcut system
│   │   ├── global-shortcut-manager.ts
│   │   ├── local-shortcut-manager.ts
│   │   ├── action-executor.ts
│   │   └── config-manager.ts
│   ├── ipc/             # Inter-Process Communication
│   │   ├── handlers/    # IPC request handlers by feature
│   │   ├── ipc-manager.ts # Central IPC registration
│   │   └── types.ts     # IPC interfaces
│   └── actions/         # Application actions (file, view, global)
├── preload/             # Secure renderer bridge
└── __tests__/unit/      # Comprehensive unit test suite
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
- **IPC Architecture**: Modular handler registration through DefaultIPCManager, feature-based handler organization, and type-safe communication patterns
- **Service Integration**: Dependency injection through constructor parameters, interface-based contracts, and centralized service factories
