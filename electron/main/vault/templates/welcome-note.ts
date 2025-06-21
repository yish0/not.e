export function createWelcomeNoteContent(vaultName: string): string {
  return `---
title: "Welcome to not.e"
type: note
created: ${new Date().toISOString()}
tags: [welcome, getting-started]
---

# Welcome to not.e! 🎉

This is your first note in your new vault: **${vaultName}**.

## What you can do:

- Create new notes with \`Ctrl+N\` (or \`Cmd+N\` on Mac)
- Save notes with \`Ctrl+S\` (or \`Cmd+S\` on Mac)
- Quick open files with \`Ctrl+P\` (or \`Cmd+P\` on Mac)
- Toggle sidebar with \`Ctrl+B\` (or \`Cmd+B\` on Mac)

## Getting Started:

1. **Explore Workspaces**: Use the sidebar to navigate between different workspaces
2. **Create Channels**: Organize your notes by topics using channels
3. **Daily Notes**: Use the daily notes feature to capture thoughts and ideas
4. **Customize**: Personalize your shortcuts and themes

## Keyboard Shortcuts:

### File Operations
- \`Ctrl+N\` / \`Cmd+N\` - Create new note
- \`Ctrl+O\` / \`Cmd+O\` - Open vault
- \`Ctrl+S\` / \`Cmd+S\` - Save current note
- \`Ctrl+Shift+S\` / \`Cmd+Shift+S\` - Save all notes

### Navigation
- \`Ctrl+P\` / \`Cmd+P\` - Quick open file
- \`Ctrl+Shift+P\` / \`Cmd+Shift+P\` - Command palette

### Search
- \`Ctrl+F\` / \`Cmd+F\` - Find in current note
- \`Ctrl+Shift+F\` / \`Cmd+Shift+F\` - Find in vault

### View
- \`Ctrl+B\` / \`Cmd+B\` - Toggle sidebar
- \`Ctrl+\\\` / \`Cmd+\\\` - Toggle preview
- \`Ctrl++\` / \`Cmd++\` - Zoom in
- \`Ctrl+-\` / \`Cmd+-\` - Zoom out
- \`Ctrl+0\` / \`Cmd+0\` - Reset zoom

### Developer
- \`F12\` or \`Ctrl+Shift+I\` / \`Cmd+Shift+I\` - Toggle developer tools

## Features Coming Soon:

- 🧩 **Plugin System**: Extend functionality with custom plugins
- 🌐 **Browser Integration**: Embed web content directly in notes
- 🎨 **Custom Themes**: Personalize your workspace appearance
- 🔄 **Git Integration**: Version control for your notes
- 🔗 **Note Linking**: Connect related notes together
- 📊 **Thread Discussions**: GitHub Issue-style note discussions

Happy note-taking! ✨

---

*This note was automatically created when you initialized your vault. Feel free to edit or delete it.*
`
}