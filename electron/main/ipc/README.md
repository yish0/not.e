# IPC Management System with Permission Control

이 모듈은 not.e 애플리케이션의 IPC(Inter-Process Communication) 관리 시스템을 구현합니다. 메인 프로세스와 렌더러 프로세스 간의 통신을 체계적으로 관리하고, 기능별로 핸들러를 분리하여 유지보수성을 높였습니다. Phase 3에서 외부 플러그인을 지원하기 위해 포괄적인 권한 관리 시스템이 포함되어 있습니다.

## 아키텍처 개요

```mermaid
graph TB
    subgraph "Renderer Process"
        A[Frontend Components]
        B[Plugin Components]
    end

    subgraph "Main Process"
        C[IPC Manager]
        D[Permission Manager]
        E[Handler Registry]
        F[Business Logic]
    end

    A --> C
    B --> C
    C --> D
    D --> E
    E --> F

    subgraph "Permission Levels"
        G[ROOT - 메인 윈도우만]
        H[PLUGIN - 플러그인 접근]
        I[PUBLIC - 제한 없음]
    end

    D --> G
    D --> H
    D --> I

    subgraph "Handler Organization"
        J[handlers/app-handlers.ts - PUBLIC]
        K[handlers/vault-handlers.ts - ROOT]
        L[handlers/plugin-handlers.ts - PLUGIN]
        M[handlers/index.ts]
    end

    subgraph "Core IPC System"
        N[core/ipc-manager.ts]
        O[permissions/permission-manager.ts]
        P[types.ts]
        Q[index.ts]
    end
```

## 핵심 컴포넌트

### 1. IPC Manager (ipc-manager.ts)

IPC 핸들러의 등록, 해제, 관리를 담당하는 중앙 관리자로, 모든 IPC 호출에 대해 권한 검증을 수행합니다.

### 2. Permission Manager (permission-manager.ts)

IPC 채널별 권한을 관리하고 접근 제어를 수행하는 핵심 보안 컴포넌트입니다.

**권한 레벨:**

- `ROOT`: 전체 시스템 접근 - 핵심 앱 기능 (메인 윈도우에서만 접근 가능)
- `PLUGIN`: 제한된 접근 - 외부 플러그인 기능
- `PUBLIC`: 공개 접근 - 민감하지 않은 작업 (제한 없음)

```typescript
import { DefaultIPCManager } from './ipc-manager'
import { IPCPermissionLevel } from './permission-manager'

const ipcManager = new DefaultIPCManager(mainWindow)

// 권한이 포함된 핸들러 등록
ipcManager.registerHandler({
  channel: 'my-channel',
  handler: (event, ...args) => {
    // 핸들러 로직
    return 'response'
  },
  permission: {
    level: IPCPermissionLevel.ROOT,
    description: 'My secure channel'
  }
})

// 다중 핸들러 등록 (권한 포함)
ipcManager.registerHandlers([
  {
    channel: 'public-channel',
    handler: handler1,
    permission: {
      level: IPCPermissionLevel.PUBLIC,
      description: 'Public access channel'
    }
  },
  {
    channel: 'plugin-channel',
    handler: handler2,
    permission: {
      level: IPCPermissionLevel.PLUGIN,
      description: 'Plugin access channel'
    }
  }
])

// 핸들러 해제
ipcManager.unregisterHandler('my-channel')

// 모든 핸들러 해제
ipcManager.unregisterAll()
```

**주요 기능:**

- 중복 등록 방지
- 등록된 채널 추적
- 일괄 등록/해제
- 디버깅을 위한 로깅
- **자동 권한 검증**: 모든 IPC 호출에 대해 권한 자동 검사
- **컨텍스트 기반 접근 제어**: 호출 소스에 따른 접근 제어

### 3. Handler Organization (handlers/)

기능별로 분리된 IPC 핸들러들로, 각각 적절한 권한 레벨이 설정되어 있습니다.

## 권한 관리 시스템

### 권한 레벨 할당

```typescript
// handlers/vault-handlers.ts - ROOT 레벨 예시
export function createVaultHandlers(context: IPCContext): IPCHandler[] {
  return [
    {
      channel: 'vault:get-current',
      handler: async () => {
        return await vaultManager.getCurrentVault()
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Get current vault configuration'
      }
    }
  ]
}

// handlers/app-handlers.ts - PUBLIC 레벨 예시
export function createAppHandlers(): IPCHandler[] {
  return [
    {
      channel: 'get-app-version',
      handler: (): string => {
        return app.getVersion()
      },
      permission: {
        level: IPCPermissionLevel.PUBLIC,
        description: 'Get application version'
      }
    }
  ]
}
```

### 플러그인 채널 관리

```typescript
import { getPermissionManager } from './permission-manager'

const permissionManager = getPermissionManager()

// 플러그인 채널 추가
permissionManager.addPluginChannel('plugin:my-feature', 'My plugin feature description')

// 플러그인 채널 제거
permissionManager.removePluginChannel('plugin:my-feature')

// 권한 레벨별 채널 조회
const rootChannels = permissionManager.getChannelsByLevel(IPCPermissionLevel.ROOT)
const pluginChannels = permissionManager.getChannelsByLevel(IPCPermissionLevel.PLUGIN)
const publicChannels = permissionManager.getChannelsByLevel(IPCPermissionLevel.PUBLIC)
```

### 권한 검증 플로우

```mermaid
sequenceDiagram
    participant R as Renderer
    participant IPC as IPC Manager
    participant PM as Permission Manager
    participant H as Handler

    R->>IPC: invoke('channel-name', args)
    IPC->>PM: checkPermission(channel, context)

    alt ROOT Level
        PM->>PM: Check if sender is main window
        alt Main Window
            PM->>IPC: Permission granted
        else Other Context
            PM->>IPC: Permission denied
        end
    else PLUGIN Level
        PM->>PM: Check plugin access rules
        PM->>IPC: Permission granted/denied
    else PUBLIC Level
        PM->>IPC: Permission granted
    end

    alt Permission Granted
        IPC->>H: Execute handler
        H->>IPC: Return result
        IPC->>R: Success response
    else Permission Denied
        IPC->>R: Error: Permission denied
    end
```

#### App Handlers (handlers/app-handlers.ts)

애플리케이션 기본 정보 및 설정 관련 핸들러들입니다.

**Available Channels:**

- `get-app-version` (PUBLIC): 앱 버전 정보 조회
- `get-platform` (PUBLIC): 플랫폼 정보 조회
- `get-cross-desktop-toggle-enabled` (ROOT): 크로스 데스크탑 토글 모드 상태 확인
- `set-cross-desktop-toggle-enabled` (ROOT): 크로스 데스크탑 토글 모드 설정 변경

```typescript
export function createAppHandlers(): IPCHandler[] {
  return [
    {
      channel: 'get-app-version',
      handler: (): string => {
        return app.getVersion()
      },
      permission: {
        level: IPCPermissionLevel.PUBLIC,
        description: 'Get application version'
      }
    },
    {
      channel: 'get-platform',
      handler: (): NodeJS.Platform => {
        return process.platform
      },
      permission: {
        level: IPCPermissionLevel.PUBLIC,
        description: 'Get platform information'
      }
    },
    {
      channel: 'get-cross-desktop-toggle-enabled',
      handler: async (): Promise<boolean> => {
        return await getCrossDesktopToggleEnabled()
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Check if cross-desktop toggle mode is enabled'
      }
    },
    {
      channel: 'set-cross-desktop-toggle-enabled',
      handler: async (_, enabled: boolean): Promise<void> => {
        await setCrossDesktopToggleEnabled(enabled)
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Set cross-desktop toggle mode enabled state'
      }
    }
  ]
}
```

#### Vault Handlers (handlers/vault-handlers.ts)

Vault 관리 관련 IPC 핸들러들입니다.

```typescript
export function createVaultHandlers(context: IPCContext): IPCHandler[] {
  const vaultManager = getVaultManager()

  return [
    {
      channel: 'vault:get-current',
      handler: async () => {
        return await vaultManager.getCurrentVault()
      }
    },
    {
      channel: 'vault:select',
      handler: async () => {
        return await vaultManager.showVaultSelectionDialog(context.mainWindow || undefined)
      }
    }
    // ... 기타 vault 핸들러들
  ]
}
```

### 3. Type System (types.ts)

IPC 시스템의 타입 정의입니다.

```typescript
export interface IPCHandler {
  channel: string
  handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
}

export interface IPCManager {
  registerHandler(handler: IPCHandler): void
  registerHandlers(handlers: IPCHandler[]): void
  unregisterHandler(channel: string): void
  unregisterAll(): void
}

export interface IPCContext {
  mainWindow: BrowserWindow | null
}
```

## 데이터 흐름

### IPC 통신 플로우

```mermaid
sequenceDiagram
    participant R as Renderer Process
    participant P as Preload Script
    participant M as Main Process
    participant IPC as IPC Manager
    participant H as Handler
    participant S as Service

    Note over R,S: Application Startup
    M->>IPC: setupIPCHandlers(context)
    IPC->>H: registerHandlers(getAllHandlers())
    H->>IPC: Return handler list
    IPC->>M: Register complete

    Note over R,S: Runtime Communication
    R->>P: electronAPI.invoke('vault:get-current')
    P->>M: ipcRenderer.invoke('vault:get-current')
    M->>IPC: Route to registered handler
    IPC->>H: Execute vault handler
    H->>S: Call VaultManager service
    S->>H: Return vault data
    H->>IPC: Return response
    IPC->>M: Response data
    M->>P: IPC response
    P->>R: Return result

    Note over R,S: Error Handling
    alt Handler Error
        H->>IPC: Throw error
        IPC->>M: Error response
        M->>P: Error data
        P->>R: Handle error
    end
```

### Handler Registration Flow

```mermaid
graph TB
    A[Main Process Startup] --> B[setupIPCHandlers]
    B --> C[Create IPCContext]
    C --> D[getAllIPCHandlers]

    D --> E[createAppHandlers]
    D --> F[createVaultHandlers]
    D --> G[createFutureHandlers...]

    E --> H[App Handler Array]
    F --> I[Vault Handler Array]
    G --> J[Other Handler Arrays]

    H --> K[Merge All Handlers]
    I --> K
    J --> K

    K --> L[IPCManager.registerHandlers]
    L --> M[Individual Registration]
    M --> N[ipcMain.handle]

    N --> O[Handler Ready]

    subgraph "Handler Creation Context"
        P[IPCContext]
        P --> Q[mainWindow: BrowserWindow]
        P --> R[Future Context Data...]
    end

    C --> P
    F --> P
```

## 사용 방법

### 기본 설정

```typescript
// main.ts에서 IPC 설정
import { setupIPCHandlers } from './ipc'

function createWindow() {
  const mainWindow = new BrowserWindow({...})

  // 윈도우 생성 후 IPC 핸들러 설정
  setupIPCHandlers({ mainWindow })
}
```

### 새로운 핸들러 추가

#### 1. 새로운 핸들러 파일 생성

```typescript
// handlers/workspace-handlers.ts
import { IPCHandler, IPCContext } from '../types'
import { getWorkspaceManager } from '../../workspace'

export function createWorkspaceHandlers(context: IPCContext): IPCHandler[] {
  const workspaceManager = getWorkspaceManager()

  return [
    {
      channel: 'workspace:list',
      handler: async () => {
        return await workspaceManager.getWorkspaces()
      }
    },
    {
      channel: 'workspace:create',
      handler: async (_, name: string, description?: string) => {
        return await workspaceManager.createWorkspace(name, description)
      }
    },
    {
      channel: 'workspace:delete',
      handler: async (_, workspaceId: string) => {
        return await workspaceManager.deleteWorkspace(workspaceId)
      }
    },
    {
      channel: 'workspace:set-active',
      handler: async (_, workspaceId: string) => {
        await workspaceManager.setActiveWorkspace(workspaceId)
        return { success: true }
      }
    }
  ]
}
```

#### 2. 핸들러 인덱스에 추가

```typescript
// handlers/index.ts
import { IPCHandler, IPCContext } from '../types'
import { createAppHandlers } from './app-handlers'
import { createVaultHandlers } from './vault-handlers'
import { createWorkspaceHandlers } from './workspace-handlers'

export function getAllIPCHandlers(context: IPCContext): IPCHandler[] {
  return [
    ...createAppHandlers(),
    ...createVaultHandlers(context),
    ...createWorkspaceHandlers(context) // 새 핸들러 추가
  ]
}

export {
  createAppHandlers,
  createVaultHandlers,
  createWorkspaceHandlers // 내보내기 추가
}
```

### Preload Script 확장

```typescript
// preload/preload.ts
export interface ElectronAPI {
  // 기존 API들...

  // Workspace API 추가
  workspace: {
    list: () => Promise<Workspace[]>
    create: (name: string, description?: string) => Promise<WorkspaceResult>
    delete: (workspaceId: string) => Promise<DeleteResult>
    setActive: (workspaceId: string) => Promise<{ success: boolean }>
  }
}

const electronAPI: ElectronAPI = {
  // 기존 구현들...

  workspace: {
    list: () => ipcRenderer.invoke('workspace:list'),
    create: (name: string, description?: string) =>
      ipcRenderer.invoke('workspace:create', name, description),
    delete: (workspaceId: string) => ipcRenderer.invoke('workspace:delete', workspaceId),
    setActive: (workspaceId: string) => ipcRenderer.invoke('workspace:set-active', workspaceId)
  }
}
```

### Renderer Process에서 사용

```typescript
// SvelteKit 컴포넌트에서
<script lang="ts">
  import { onMount } from 'svelte'

  let workspaces: Workspace[] = []
  let currentVault: VaultConfig | null = null

  onMount(async () => {
    // Vault 정보 가져오기
    currentVault = await window.electronAPI.vault.getCurrent()

    // Workspace 목록 가져오기
    workspaces = await window.electronAPI.workspace.list()
  })

  async function createNewWorkspace() {
    const result = await window.electronAPI.workspace.create(
      'New Workspace',
      'A workspace for new ideas'
    )

    if (result.success) {
      // 목록 새로고침
      workspaces = await window.electronAPI.workspace.list()
    }
  }

  async function selectVault() {
    const result = await window.electronAPI.vault.select()
    if (result.success) {
      currentVault = result.vault
    }
  }
</script>

<div>
  <h2>Current Vault: {currentVault?.name || 'No vault selected'}</h2>
  <button on:click={selectVault}>Select Vault</button>

  <h3>Workspaces</h3>
  {#each workspaces as workspace}
    <div>{workspace.name}</div>
  {/each}

  <button on:click={createNewWorkspace}>Create Workspace</button>
</div>
```

## 고급 기능

### 컨텍스트 기반 핸들러

```typescript
// IPCContext 확장
export interface IPCContext {
  mainWindow: BrowserWindow | null
  currentVault?: VaultConfig
  userSettings?: UserSettings
  pluginManager?: PluginManager
}

// 컨텍스트 활용 핸들러
export function createAdvancedHandlers(context: IPCContext): IPCHandler[] {
  return [
    {
      channel: 'vault:quick-action',
      handler: async (_, action: string) => {
        if (!context.currentVault) {
          throw new Error('No vault selected')
        }

        // 현재 vault 컨텍스트를 활용한 빠른 액션
        return await performQuickAction(action, context.currentVault)
      }
    }
  ]
}
```

### 에러 처리 및 로깅

```typescript
// 에러 처리가 포함된 핸들러
export function createRobustHandlers(): IPCHandler[] {
  return [
    {
      channel: 'safe-operation',
      handler: async (event, ...args) => {
        try {
          const result = await riskyOperation(...args)

          // 성공 로깅
          console.log(`Operation completed: ${event.sender.id}`)

          return { success: true, data: result }
        } catch (error) {
          // 에러 로깅
          console.error(`Operation failed: ${error.message}`)

          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    }
  ]
}
```

### 권한 기반 핸들러

```typescript
// 권한 검사가 포함된 핸들러
export function createSecureHandlers(context: IPCContext): IPCHandler[] {
  return [
    {
      channel: 'admin:delete-vault',
      handler: async (event, vaultPath: string) => {
        // 권한 검사
        const hasPermission = await checkAdminPermission(event.sender)
        if (!hasPermission) {
          throw new Error('Insufficient permissions')
        }

        // 안전 검사
        if (vaultPath === context.currentVault?.path) {
          throw new Error('Cannot delete currently active vault')
        }

        return await deleteVault(vaultPath)
      }
    }
  ]
}
```

## 테스팅

### IPC 핸들러 테스트

```typescript
// ipc-manager.test.ts
describe('DefaultIPCManager', () => {
  let ipcManager: DefaultIPCManager
  let mockIpcMain: any

  beforeEach(() => {
    mockIpcMain = {
      handle: jest.fn(),
      removeHandler: jest.fn()
    }

    // Electron ipcMain 모킹
    jest.mock('electron', () => ({
      ipcMain: mockIpcMain
    }))

    ipcManager = new DefaultIPCManager()
  })

  test('should register handler correctly', () => {
    const handler: IPCHandler = {
      channel: 'test-channel',
      handler: () => 'test-response'
    }

    ipcManager.registerHandler(handler)

    expect(mockIpcMain.handle).toHaveBeenCalledWith('test-channel', handler.handler)
  })

  test('should prevent duplicate registration', () => {
    const handler: IPCHandler = {
      channel: 'test-channel',
      handler: () => 'test-response'
    }

    ipcManager.registerHandler(handler)
    ipcManager.registerHandler(handler) // 중복 등록

    expect(mockIpcMain.handle).toHaveBeenCalledTimes(1)
  })
})
```

### 핸들러 로직 테스트

```typescript
// vault-handlers.test.ts
describe('Vault Handlers', () => {
  let mockVaultManager: any
  let mockContext: IPCContext

  beforeEach(() => {
    mockVaultManager = {
      getCurrentVault: jest.fn(),
      setCurrentVault: jest.fn(),
      getRecentVaults: jest.fn()
    }

    mockContext = {
      mainWindow: null
    }

    // VaultManager 모킹
    jest.mock('../../vault', () => ({
      getVaultManager: () => mockVaultManager
    }))
  })

  test('vault:get-current should return current vault', async () => {
    const mockVault = { name: 'Test Vault', path: '/test/path' }
    mockVaultManager.getCurrentVault.mockResolvedValue(mockVault)

    const handlers = createVaultHandlers(mockContext)
    const getCurrentHandler = handlers.find((h) => h.channel === 'vault:get-current')

    const result = await getCurrentHandler?.handler({} as any)

    expect(result).toBe(mockVault)
    expect(mockVaultManager.getCurrentVault).toHaveBeenCalled()
  })
})
```

## 성능 최적화

### 핸들러 지연 로딩

```typescript
// 지연 로딩 핸들러 팩토리
export function createLazyHandlers(): IPCHandler[] {
  return [
    {
      channel: 'heavy-operation',
      handler: async (...args) => {
        // 필요할 때만 모듈 로드
        const { performHeavyOperation } = await import('./heavy-operations')
        return await performHeavyOperation(...args)
      }
    }
  ]
}
```

### 응답 캐싱

```typescript
// 캐시가 포함된 핸들러
const cache = new Map<string, { data: any; timestamp: number }>()

export function createCachedHandlers(): IPCHandler[] {
  return [
    {
      channel: 'expensive-data',
      handler: async (event, key: string) => {
        const cached = cache.get(key)
        const now = Date.now()

        // 5분 캐시
        if (cached && now - cached.timestamp < 5 * 60 * 1000) {
          return cached.data
        }

        const data = await fetchExpensiveData(key)
        cache.set(key, { data, timestamp: now })

        return data
      }
    }
  ]
}
```

## 보안 고려사항

### 입력 검증

```typescript
// 입력 검증이 포함된 핸들러
export function createValidatedHandlers(): IPCHandler[] {
  return [
    {
      channel: 'create-file',
      handler: async (event, filename: string, content: string) => {
        // 파일명 검증
        if (!filename || typeof filename !== 'string') {
          throw new Error('Invalid filename')
        }

        // 경로 탐색 공격 방지
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
          throw new Error('Invalid filename: path traversal detected')
        }

        // 콘텐츠 크기 제한
        if (content.length > 1024 * 1024) {
          // 1MB 제한
          throw new Error('Content too large')
        }

        return await createFile(filename, content)
      }
    }
  ]
}
```

### 권한 관리

```typescript
// 권한 기반 접근 제어
interface Permission {
  action: string
  resource: string
}

async function checkPermission(senderId: number, permission: Permission): Promise<boolean> {
  // 실제 권한 검사 로직
  return true // 또는 false
}

export function createProtectedHandlers(): IPCHandler[] {
  return [
    {
      channel: 'protected-action',
      handler: async (event, action: string, resource: string) => {
        const hasPermission = await checkPermission(event.sender.id, { action, resource })

        if (!hasPermission) {
          throw new Error(`Access denied: ${action} on ${resource}`)
        }

        return await performProtectedAction(action, resource)
      }
    }
  ]
}
```

## 모범 사례

1. **채널 명명 규칙**: `feature:action` 형태로 일관성 있게 명명
2. **에러 처리**: 모든 핸들러에서 적절한 에러 처리 구현
3. **타입 안전성**: TypeScript를 활용한 강타입 정의
4. **문서화**: 각 핸들러의 목적과 사용법 명확히 문서화
5. **테스트**: 핸들러 로직에 대한 단위 테스트 작성
6. **보안**: 입력 검증과 권한 확인 철저히 구현
7. **성능**: 필요에 따라 캐싱과 지연 로딩 활용
