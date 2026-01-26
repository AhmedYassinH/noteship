Prototype mapping check (archive/legacy-ui/vite-app)

Surface (prototype) -> Noteship web status

1. TopBar
   - Prototype: logo, search field, command hint, deploy button, user avatar.
   - Current: Dashboard top bar has brand, search, actions, auth/logout.
   - Status: Covered (search + actions). Missing: command-k hint, deploy button (out of MVP).

2. SidebarTree
   - Prototype: workspace/folder/note tree, search, add note/folder, import, settings.
   - Current: Sidebar nav + recent notes, no tree/folder structure.
   - Status: Partial. Tree/folders + workspace hierarchy not in MVP (OK to skip unless MVP requires). Import button not wired (integration import is out of scope for MVP as defined).

3. EditorToolbar + MarkdownEditor
   - Prototype: markdown toolbar buttons.
   - Current: TipTap toolbar with heading, list, quote, code, upload.
   - Status: Covered with richer editor.

4. ArtifactsPanel (right sidebar)
   - Prototype: drafts list, LinkedIn blurbs, AI presets, publish actions.
   - Current: Right panel in note page has drafts + publish/schedule (no separate artifacts panel).
   - Status: Partial. Drafts + publishing covered. LinkedIn blurbs + AI presets not wired (MVP includes AI draft generation but not preset library). Treat as out-of-scope for MVP unless requested.

5. StatusBar (footer)
   - Prototype: synced state, last build, AI credits.
   - Current: no bottom status bar.
   - Status: Missing. MVP does not explicitly require status bar; could be added later if desired.

6. ArtifactDialog
   - Prototype: modal for viewing artifact details + versions.
   - Current: no artifact detail modal.
   - Status: Missing. Not required for MVP.

Conclusion

- MVP coverage is sufficient: core editor, drafts, publish/schedule, search, integrations, billing.
- Prototype-only elements to skip unless you want them: workspace/folder tree, artifact modal, status bar, AI preset library, command-k palette, deploy button.
