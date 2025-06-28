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

### Development Configuration

The application uses separate configuration files for development and production environments:

- **Development Mode**: `app-config.dev.json` - Used when `NODE_ENV=development` or `NODE_ENV` is undefined
- **Production Mode**: `app-config.json` - Used in production builds

This separation allows developers to maintain different settings (window modes, shortcuts, vault configurations) during development without affecting production configurations. The configuration files are automatically created in the user's data directory (`userData`) when the application first runs.

### Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 개발 환경 설정

### 필수 요구사항

- **Node.js**: 20.x 이상
- **Bun**: 최신 버전 (패키지 매니저)
- **macOS**: 10.14+ (Mojave 이상)
- **Xcode Command Line Tools**: Git 및 네이티브 컴파일용

### 초기 설정

```bash
# 저장소 클론
git clone https://github.com/yish0/not.e.git
cd not.e

# 의존성 설치
bun install

# 개발 서버 시작 (SvelteKit + Electron)
bun run dev

# 별도 터미널에서 Electron만 실행 (빠른 재시작용)
bun run dev:electron-only
```

### 개발 스크립트

```bash
# 개발 관련
bun run dev                 # 전체 개발 서버 (SvelteKit + Electron)
bun run dev:svelte         # SvelteKit 개발 서버만
bun run dev:electron-only  # Electron만 (SvelteKit이 이미 실행 중일 때)

# 빌드 관련
bun run build              # 프로덕션 빌드
bun run build:svelte       # SvelteKit 빌드만
bun run build:electron     # Electron 빌드만

# 패키징 관련
bun run package            # 배포용 패키징
bun run package:dir        # 테스트용 패키징 (압축 없음)

# 품질 관리
bun run lint               # ESLint 검사
bun run lint:fix          # ESLint 자동 수정
bun run typecheck         # TypeScript 타입 검사
bun run test              # 단위 테스트 실행
bun run test:watch        # 테스트 워치 모드
bun run test:coverage     # 테스트 커버리지

# Makefile 명령어 (권장)
make dev                  # 개발 서버 시작
make build                # 프로덕션 빌드
make test                 # 테스트 실행
make qa                   # 품질 검사 파이프라인
make ci                   # CI 파이프라인
make clean                # 빌드 파일 정리
```

## 개발 가이드

### 코드 스타일

- **TypeScript**: 세미콜론 없음 (`;`)
- **포매팅**: Prettier 사용
- **린트**: ESLint + TypeScript 규칙
- **패키지 매니저**: `bun` 사용 (`npm` 금지)

### 아키텍처 원칙

- **단일 책임 원칙**: 각 모듈은 하나의 역할만
- **의존성 주입**: 인터페이스 기반 설계
- **Repository 패턴**: 데이터 접근 레이어 분리
- **Factory 패턴**: 객체 생성 로직 캡슐화
- **모듈식 설계**: 파일당 최대 200-300줄

### 설정 시스템

프로젝트는 이중 설정 구조를 사용합니다:

**Vault 선택 설정** (전역):
- 개발: `{프로젝트루트}/.dev-config/vault-selection.json`
- 프로덕션: `{userData}/vault-selection.json`

**앱 설정** (Vault별):
- 개발: `{vault}/.not.e/app-config.dev.json`
- 프로덕션: `{vault}/.not.e/app-config.json`

### 개발용 Vault 사용

```bash
# 개발용 Vault가 프로젝트에 포함되어 있습니다
# 경로: ./dev-vault/

# 애플리케이션에서 이 경로를 Vault로 선택하여 사용
# - 사전 설정된 사이드바 토글 모드
# - 테스트용 워크스페이스와 채널
# - 설정 테스트 체크리스트 포함
```

### 테스트 실행

```bash
# 전체 테스트
bun run test

# 특정 모듈 테스트
bun x jest electron/__tests__/unit/vault/
bun x jest electron/__tests__/unit/shortcuts/

# 단일 파일 테스트
bun x jest electron/__tests__/unit/vault/vault-repository.test.ts

# 워치 모드로 테스트
bun run test:watch

# 커버리지 포함 테스트
bun run test:coverage
```

### 주요 디렉토리 구조

```
electron/main/
├── actions/         # 카테고리별 애플리케이션 액션
│   ├── file/        # 파일 관련 액션
│   ├── view/        # 뷰 관련 액션
│   ├── global/      # 전역 윈도우 관리
│   ├── edit/        # 편집 액션
│   ├── navigation/  # 네비게이션 액션
│   └── dev/         # 개발용 액션
├── core/            # 핵심 시스템
│   ├── window/      # 윈도우 관리
│   ├── lifecycle/   # 앱 생명주기
│   └── integration/ # 시스템 통합
├── ipc/             # IPC 통신
│   ├── core/        # IPC 매니저
│   ├── handlers/    # 기능별 핸들러
│   └── permissions/ # 권한 관리
├── shortcuts/       # 단축키 시스템
│   ├── managers/    # 전역/로컬 매니저
│   ├── actions/     # 액션 실행기
│   └── config/      # 설정 관리
└── vault/           # Vault 시스템
    ├── core/        # Vault 팩토리
    ├── managers/    # Vault 매니저
    ├── services/    # 비즈니스 로직
    ├── repositories/ # 데이터 접근
    └── types/       # 타입 정의
```

### 개발 팁

**빠른 개발 워크플로우**:
1. `make dev` 또는 `bun run dev`로 시작
2. 코드 변경 시 자동 핫리로드
3. Electron 프로세스는 `electronmon`으로 자동 재시작

**디버깅**:
- **메인 프로세스**: VS Code 디버거 또는 `console.log`
- **렌더러 프로세스**: 브라우저 개발자 도구 (Cmd+Option+I)
- **IPC 통신**: 네트워크 탭에서 확인 가능

**테스트 작성**:
- 각 모듈별 단위 테스트 작성
- Mock 객체는 `__tests__/mocks/` 활용
- 통합 테스트는 실제 파일 시스템 사용

**커밋 메시지**:
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 변경
- `test:` 테스트 추가/수정
- `refactor:` 리팩토링

### 문제 해결

**자주 발생하는 문제**:

1. **의존성 충돌**: `rm -rf node_modules && bun install`
2. **타입 에러**: `bun run typecheck`로 확인
3. **테스트 실패**: 특정 모듈만 `bun x jest` 로 실행
4. **빌드 실패**: `make clean && make build`로 클린 빌드

**성능 최적화**:
- 개발 중에는 `bun run dev:electron-only` 사용
- 타입체크는 IDE에서 실시간으로, 빌드 시에만 전체 검사
- 테스트는 워치 모드로 변경된 부분만 실행

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Community

- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/yish0/not.e/issues)
- **Discussions**: Join conversations on [GitHub Discussions](https://github.com/yish0/not.e/discussions)

---

**Made with ❤️ by developers, for developers (and everyone else too!)**
