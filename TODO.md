# TODO List

## Technical Debt & Improvements

### ✅ ES Module Directory Import Fix (COMPLETED)

**Issue Resolved:** Directory import errors have been fixed using Option B approach.

**Solution Implemented:** Eliminated index files and used direct imports

- **Approach**: Option B - Eliminate Index Files and Use Direct Imports
- **Completed on**: 2024-12-22
- **Status**: ✅ COMPLETED SUCCESSFULLY

**What was Done:**

- **Phase 1**: ✅ Eliminated index files in core modules and used direct imports
- **Phase 2**: ✅ Eliminated index files in action modules and used direct imports
- **Phase 3**: ✅ Eliminated index files in IPC modules and used direct imports
- **Phase 4**: ✅ Eliminated index files in shortcut modules and used direct imports
- **Phase 5**: ✅ Eliminated index files in vault modules and used direct imports
- **Phase 6**: ✅ Tested all functionality and verified build works

**Changes Made:**

1. **Removed all index.ts files** from subdirectories in core, actions, ipc, shortcuts, and vault modules
2. **Updated all imports** to use direct file paths instead of directory imports:
   - `from './core'` → `from './core/lifecycle/app-lifecycle'`
   - `from './actions/file'` → `from './actions/file/file-actions'`
   - `from './shortcuts/types'` → `from './shortcuts/types/shortcut-types'`
   - `from './vault/core'` → `from './vault/core/vault-factory'`
   - etc.
3. **Fixed test imports** to match the new direct import structure
4. **Verified functionality** through comprehensive testing

**Results:**

- ✅ Development workflow (`make dev`) now works without errors
- ✅ TypeScript compilation passes successfully
- ✅ All unit tests (129 tests) pass
- ✅ Production build works correctly
- ✅ Electron packaging works successfully
- ✅ No ES module import errors

**Benefits Achieved:**

- More explicit imports showing exactly what's being imported
- Smaller bundle sizes (no unnecessary index.ts re-exports)
- Cleaner architecture with direct dependencies
- Better IDE support for navigating to actual implementation files
- Eliminated all module resolution ambiguity

**Commercial Impact:**

- ✅ Development workflow fully restored
- ✅ Production builds working
- ✅ Ready for commercial development and deployment

---

## Other TODOs

### 🔄 Window Mode System Redesign (HIGH PRIORITY)

**현재 상황:**

- 이중 토글 모드 시스템 (표준 토글 vs 크로스 데스크탑 토글)
- 사용자가 `enableCrossDesktopToggle` 설정으로 모드 선택 가능
- 두 토글 액션이 모두 항상 활성화되어 있음

**요구사항:**

1. **일반 모드**: 윈도우 토글 기능이 완전히 비활성화
2. **토글 모드**: 토글 기능 활성화 + 두 가지 서브 옵션
   - **사이드바 토글**: 디스플레이 사이드에 고정 사이즈로 토글
   - **표준 토글**: 기존 윈도우 사이즈/위치 그대로 토글

---

#### **Phase 1: 설정 구조 재설계**

**Priority**: HIGH  
**Effort**: 2-3 hours  
**Risk**: LOW

**현재 설정:**

```typescript
interface AppConfig {
  enableCrossDesktopToggle?: boolean
}
```

**새로운 설정:**

```typescript
interface AppConfig {
  windowMode: 'normal' | 'toggle'
  toggleSettings?: {
    toggleType: 'sidebar' | 'standard'
    sidebarPosition?: 'left' | 'right'
    sidebarWidth?: number // 픽셀 단위, 기본값 400
  }
}
```

**구현 작업:**

1. **vault-types.ts 업데이트**

   - AppConfig 인터페이스 변경
   - 기본값 정의 (windowMode: 'normal')

2. **app-config-repository.ts 마이그레이션 로직**

   - 기존 `enableCrossDesktopToggle` 설정을 새 구조로 변환
   - 마이그레이션 함수 구현: `migrateOldConfig()`

3. **기본값 설정**
   - windowMode: 'normal'
   - toggleSettings.toggleType: 'standard'
   - toggleSettings.sidebarPosition: 'right'
   - toggleSettings.sidebarWidth: 400

---

#### **Phase 2: 액션 시스템 재구성**

**Priority**: HIGH  
**Effort**: 3-4 hours  
**Risk**: MEDIUM

**현재 액션:**

- `toggle-window`: 표준 토글
- `toggle-window-cross-desktop`: 크로스 데스크탑 토글

**새로운 액션:**

- `toggle-window-sidebar`: 사이드바 토글 (새로 구현)
- `toggle-window-standard`: 표준 토글 (기존 toggle-window 수정)
- 일반 모드에서는 토글 액션들이 비활성화

**구현 작업:**

1. **global-actions.ts 재구성**

   ```typescript
   // 기존 toggle-window, toggle-window-cross-desktop 제거
   // 새로운 액션들 추가:

   'toggle-window-sidebar': async (actionContext: ActionContext) => {
     const config = await getAppConfig();
     if (config.windowMode !== 'toggle') {
       console.log('Toggle disabled in normal mode');
       return;
     }
     // 사이드바 토글 로직 구현
   },

   'toggle-window-standard': async (actionContext: ActionContext) => {
     const config = await getAppConfig();
     if (config.windowMode !== 'toggle') {
       console.log('Toggle disabled in normal mode');
       return;
     }
     // 표준 토글 로직 구현 (기존 코드 재사용)
   }
   ```

2. **새로운 사이드바 토글 로직 구현**

   - `window-utils.ts`에 새 함수 추가:
     - `showWindowAsSidebar(window, position: 'left'|'right', width: number)`
     - `getSidebarBounds(display, position, width)`
   - 사이드바 위치와 크기를 설정에 따라 계산
   - 윈도우를 고정 위치에 고정 사이즈로 표시

3. **액션 등록 시스템 수정**
   - 일반 모드에서는 토글 액션들을 등록하지 않음
   - 토글 모드에서만 해당 액션들 활성화

---

#### **Phase 3: 단축키 시스템 업데이트**

**Priority**: HIGH  
**Effort**: 1-2 hours  
**Risk**: LOW

**현재 단축키:**

- DEFAULT_GLOBAL_SHORTCUTS: Cmd+Shift+T → toggle-window
- CROSS_DESKTOP_GLOBAL_SHORTCUTS: Cmd+Shift+T → toggle-window-cross-desktop

**새로운 단축키:**

```typescript
// 일반 모드: 토글 단축키 없음
const NORMAL_MODE_SHORTCUTS = {
  // 토글 관련 단축키 제거
}

// 토글 모드: 설정에 따라 동적 할당
const TOGGLE_MODE_SHORTCUTS = {
  'CmdOrCtrl+Shift+T': 'toggle-window-sidebar', // 사이드바 모드일 때
  // 또는
  'CmdOrCtrl+Shift+T': 'toggle-window-standard' // 표준 모드일 때
}
```

**구현 작업:**

1. **default-shortcuts.ts 재구성**

   - 설정 기반 동적 단축키 생성 함수
   - `generateShortcutsForMode(windowMode, toggleSettings)`

2. **shortcut-manager.ts 업데이트**
   - 설정 변경 시 단축키 재등록
   - 모드 전환 시 기존 단축키 해제 후 새로운 단축키 등록

---

#### **Phase 4: IPC API 확장**

**Priority**: MEDIUM  
**Effort**: 2-3 hours  
**Risk**: LOW

**현재 IPC:**

- get-cross-desktop-toggle-enabled
- set-cross-desktop-toggle-enabled

**새로운 IPC:**

```typescript
// 기존 IPC 제거하고 새로운 API로 교체
'get-window-mode': () => Promise<'normal' | 'toggle'>;
'set-window-mode': (mode: 'normal' | 'toggle') => Promise<void>;
'get-toggle-settings': () => Promise<ToggleSettings>;
'set-toggle-settings': (settings: ToggleSettings) => Promise<void>;
'get-app-config': () => Promise<AppConfig>; // 전체 설정 조회
```

**구현 작업:**

1. **app-handlers.ts 업데이트**

   - 기존 핸들러 제거
   - 새로운 핸들러들 구현
   - 설정 변경 시 단축키 시스템 재초기화

2. **preload.ts API 확장**

   - 새로운 IPC 메서드들을 renderer에 노출
   - TypeScript 타입 정의 추가

3. **설정 변경 시 리액션 시스템**
   - 모드 변경 시 단축키 매니저 재초기화
   - 액션 등록 상태 업데이트

---

#### **Phase 5: UI 설정 페이지 (선택사항)**

**Priority**: LOW  
**Effort**: 4-5 hours  
**Risk**: LOW

**구현 대상:**

- 윈도우 모드 선택 (일반 vs 토글)
- 토글 모드에서 토글 타입 선택 (사이드바 vs 표준)
- 사이드바 설정 (위치, 너비)

**구현 작업:**

1. **SvelteKit 설정 페이지 구현**

   - 라디오 버튼으로 모드 선택
   - 토글 모드에서만 서브 옵션 표시
   - 실시간 설정 미리보기

2. **설정 저장 및 적용**
   - IPC를 통한 설정 저장
   - 변경 사항 즉시 적용

---

#### **Phase 6: 테스트 업데이트**

**Priority**: HIGH  
**Effort**: 2-3 hours  
**Risk**: LOW

**구현 작업:**

1. **단위 테스트 업데이트**

   - window-utils.test.ts에 사이드바 관련 테스트 추가
   - app-handlers.test.ts에 새로운 IPC 핸들러 테스트
   - 설정 마이그레이션 테스트

2. **통합 테스트**
   - 모드 전환 시 단축키 변경 테스트
   - 액션 활성화/비활성화 테스트

---

#### **예상 완료 시간**: 총 12-18 시간

#### **상업적 영향**:

- ✅ 사용자 경험 크게 개선 (모드 기반 명확한 구분)
- ✅ 사이드바 토글로 생산성 향상
- ✅ 설정 시스템 확장성 확보
- ⚠️ 기존 사용자의 설정 마이그레이션 필요

#### **리스크 평가**:

- **LOW**: 기존 아키텍처 재사용 가능
- **MEDIUM**: 단축키 시스템 재등록 로직의 안정성
- **MITIGATION**: 각 Phase별 독립적 테스트 및 롤백 가능한 구조

<!-- Add other TODO items here as they come up -->
