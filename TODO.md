# TODO List

## Technical Debt & Improvements

### Module System Refactoring (High Priority)
**Current Issue:**
- Electron main process uses mixed module systems (ES module syntax compiled to CommonJS)
- Temporary workaround: `dist/package.json` with `"type": "commonjs"` to resolve module loading conflicts
- Developer writes ES module syntax but TypeScript compiles to CommonJS, creating inconsistency

**Why This Needs to be Fixed:**
- **Code Consistency**: Developer-written code should match runtime execution
- **Future-Proofing**: JavaScript ecosystem is moving towards ES modules
- **Maintainability**: Mixed module systems create confusion and technical debt
- **Performance**: ES modules enable better static analysis and tree-shaking
- **Commercial Viability**: Consistent, modern codebase is crucial for commercial projects

**Recommended Solution:**
1. Update `tsconfig.electron.json`:
   ```json
   {
     "compilerOptions": {
       "module": "ESNext"
     }
   }
   ```

2. Fix directory imports by adding explicit `.js` extensions:
   ```typescript
   // electron/main/main.ts
   import { getAppLifecycleManager } from './core/index.js'
   ```

3. Remove `dist/package.json` workaround

4. Ensure all Electron main process imports use explicit file extensions for ES module compatibility

**Benefits After Refactoring:**
- Unified ES module system across entire codebase (SvelteKit + Electron)
- Better IDE support and static analysis
- Improved build tooling compatibility
- Future-ready for ES-module-only packages
- Cleaner, more maintainable code architecture

**Estimated Effort:** Medium (2-3 hours)
**Risk Level:** Low (well-tested pattern, incremental changes possible)
**Priority:** High (should be done before production release)

---

## Other TODOs
<!-- Add other TODO items here as they come up -->