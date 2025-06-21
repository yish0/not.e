import type { ShortcutAction } from '../shortcuts/types'
import { createFileActions } from './file'
import { createNavigationActions } from './navigation'
import { createEditActions } from './edit'
import { createViewActions } from './view'
import { createDevActions } from './dev'
import { createGlobalActions } from './global'

export function getAllDefaultActions(): ShortcutAction[] {
  return [
    ...createFileActions(),
    ...createNavigationActions(),
    ...createEditActions(),
    ...createViewActions(),
    ...createDevActions(),
    ...createGlobalActions()
  ]
}

export function getActionsByCategory(category: string): ShortcutAction[] {
  const allActions = getAllDefaultActions()
  return allActions.filter((action) => action.category === category)
}

export {
  createFileActions,
  createNavigationActions,
  createEditActions,
  createViewActions,
  createDevActions,
  createGlobalActions
}
