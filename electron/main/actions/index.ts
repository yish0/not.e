import type { ShortcutAction } from '../shortcuts/types/shortcut-types'
import { createFileActions } from './file/file-actions'
import { createNavigationActions } from './navigation/navigation-actions'
import { createEditActions } from './edit/edit-actions'
import { createViewActions } from './view/view-actions'
import { createDevActions } from './dev/dev-actions'
import { createGlobalActions } from './global/global-actions'

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
