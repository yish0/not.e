import { ShortcutAction } from '../shortcuts/types'
import { createFileActions, createNavigationActions, createEditActions } from './base-actions'
import { createViewActions, createDevActions } from './view-actions'
import { createGlobalActions } from './global-actions'

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
