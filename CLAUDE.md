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
- `bun run build` - Build the application for production
- `bun run package` - Package the Electron application
- `bun run lint` - Check code formatting and linting
- `bun run lint:fix` - Fix formatting and linting issues
- `bun run typecheck` - Run TypeScript type checking

### Architecture Overview

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layout/       # Layout components
│   │   └── common/       # Common reusable components
│   └── utils.ts          # Utility functions
├── routes/               # SvelteKit pages
├── styles/               # Global styles
└── types/               # TypeScript definitions

electron/
├── main/                # Electron main process
├── preload/             # Preload scripts
└── config.ts           # Electron configuration
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
