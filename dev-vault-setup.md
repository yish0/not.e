# Development Vault Setup Guide

## Quick Setup

The development vault has been created at `./dev-vault/` with the following structure:

```
dev-vault/
├── README.md                              # Documentation
├── .note/                                 # Vault metadata
│   ├── vault.json                        # Vault info
│   └── workspaces.json                   # Workspace config
├── .not.e/                               # App settings
│   └── app-config.dev.json              # Pre-configured settings
└── workspace-development/                # Development workspace
    ├── .workspace.json                   # Workspace metadata
    ├── channel-testing/                  # Testing area
    │   └── welcome.md                    # Getting started
    └── channel-features/                 # Feature development
        └── configuration-testing.md     # Test checklist
```

## How to Use

1. **Start the application in development mode**:
   ```bash
   bun run dev
   ```

2. **Select the development vault**:
   - Path: `/path/to/your/project/dev-vault`
   - The vault will be detected automatically

3. **Test configurations**:
   - Pre-configured with sidebar toggle mode
   - Left position, 300px width
   - All settings stored in `.not.e/app-config.dev.json`

## Pre-configured Features

- **Vault Name**: "Development Vault"
- **Window Mode**: Toggle (sidebar mode)
- **Sidebar Position**: Left
- **Sidebar Width**: 300px
- **Workspace**: "Development" with testing and features channels

## Benefits

- ✅ Isolated development environment
- ✅ No interference with production vaults
- ✅ Pre-configured for testing new features
- ✅ Excluded from git commits
- ✅ Ready-to-use workspace structure
- ✅ Testing documentation included

## Next Steps

1. Open the vault in the application
2. Test different window modes and configurations
3. Validate app settings persistence
4. Use the testing checklist in the features channel
5. Experiment with vault system functionality

---

*The dev-vault is ready for use! Start the application and select this vault to begin testing.*