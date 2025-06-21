# not.e Development Makefile
# Common development commands for not.e application

.DEFAULT_GOAL := help
.PHONY: help dev dev-svelte dev-electron dev-electron-only build build-svelte build-electron preview package package-dir format lint lint-fix typecheck test test-watch test-coverage clean install

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

## Development Commands

dev: ## Start full development environment (SvelteKit + Electron)
	@echo "$(BLUE)Starting development environment...$(NC)"
	bun run dev

dev-svelte: ## Start SvelteKit development server only
	@echo "$(BLUE)Starting SvelteKit development server...$(NC)"
	bun run dev:svelte

dev-electron: ## Start Electron in development mode (requires SvelteKit server)
	@echo "$(BLUE)Starting Electron development mode...$(NC)"
	bun run dev:electron

dev-electron-only: ## Start Electron only (after manual SvelteKit build)
	@echo "$(BLUE)Starting Electron only...$(NC)"
	bun run dev:electron-only

## Build Commands

build: ## Build the entire application for production
	@echo "$(GREEN)Building application for production...$(NC)"
	bun run build

build-svelte: ## Build SvelteKit application
	@echo "$(GREEN)Building SvelteKit application...$(NC)"
	bun run build:svelte

build-electron: ## Build Electron main process
	@echo "$(GREEN)Building Electron main process...$(NC)"
	bun run build:electron

preview: ## Preview production build
	@echo "$(BLUE)Starting preview server...$(NC)"
	bun run preview

## Package Commands

package: ## Package the Electron application for distribution
	@echo "$(GREEN)Packaging application...$(NC)"
	bun run package

package-dir: ## Package without creating distributable (faster for testing)
	@echo "$(GREEN)Packaging application (directory only)...$(NC)"
	bun run package:dir

## Code Quality Commands

format: ## Format code with Prettier
	@echo "$(YELLOW)Formatting code...$(NC)"
	bun run format

lint: ## Check code formatting and linting
	@echo "$(YELLOW)Checking code quality...$(NC)"
	bun run lint

lint-fix: ## Fix formatting and linting issues
	@echo "$(YELLOW)Fixing code quality issues...$(NC)"
	bun run lint:fix

typecheck: ## Run TypeScript type checking
	@echo "$(YELLOW)Running TypeScript type check...$(NC)"
	bun run typecheck

## Test Commands

test: ## Run all unit tests
	@echo "$(BLUE)Running unit tests...$(NC)"
	bun run test

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	bun run test:watch

test-coverage: ## Run tests with coverage report
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	bun run test:coverage

test-shortcuts: ## Run shortcut-specific tests
	@echo "$(BLUE)Running shortcut tests...$(NC)"
	bun x jest electron/__tests__/unit/shortcuts/

test-vault: ## Run vault-specific tests
	@echo "$(BLUE)Running vault tests...$(NC)"
	bun x jest electron/__tests__/unit/vault/

## Utility Commands

install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	bun install

clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf dist build release node_modules/.cache

deps-check: ## Check for outdated dependencies
	@echo "$(BLUE)Checking for outdated dependencies...$(NC)"
	bun outdated

deps-update: ## Update dependencies
	@echo "$(GREEN)Updating dependencies...$(NC)"
	bun update

## Quality Assurance Pipeline

qa: lint typecheck test ## Run full quality assurance pipeline
	@echo "$(GREEN)✅ All quality checks passed!$(NC)"

ci: install qa build ## Run CI pipeline (install, qa, build)
	@echo "$(GREEN)✅ CI pipeline completed successfully!$(NC)"

## Help

help: ## Show this help message
	@echo "$(GREEN)not.e Development Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Usage:$(NC)"
	@echo "  make [target]"
	@echo ""
	@echo "$(YELLOW)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(BLUE)%-18s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Examples:$(NC)"
	@echo "  make dev          # Start development environment"
	@echo "  make build        # Build for production"
	@echo "  make test         # Run tests"
	@echo "  make qa           # Run quality assurance pipeline"
	@echo ""