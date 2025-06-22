import { getAppLifecycleManager } from './core/lifecycle/app-lifecycle'

async function main(): Promise<void> {
  const appLifecycle = getAppLifecycleManager()
  await appLifecycle.initialize()
}

// Start the application
main().catch((error) => {
  console.error('Failed to start application:', error)
  process.exit(1)
})
