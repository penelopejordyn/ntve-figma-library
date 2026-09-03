# NTVE Figma Component Library

This folder is a visual HTML/CSS reference for the main NTVE app. It separates the interface into reusable components and full-screen compositions that can be captured into Figma.

The canonical presentation is the 13-inch iPad landscape layout (`1376 × 1032`) in Light mode. It includes the navigation rail, project Library drawer, command search, Home/Create view, Agent/Chat view, Open code-editor panel, Preview panel, panel resize handles, and the requested Run dropdown. The Settings view is intentionally excluded.

## Open the library

You can open `index.html` directly in a browser. For the most reliable asset loading, serve the folder locally:

```sh
cd /Users/pennymarshall/NTVE/ntve-figma-library
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173).

## Bring it into Figma

1. Open the local page at `http://localhost:4173` and choose the component sheet or full composition you want.
2. Use your preferred Figma HTML capture/import plugin or browser extension to capture that local URL.
3. Import at 1× scale, preserving the `1376 × 1032` frame for full landscape compositions.
4. Turn repeated imported layers into Figma components and map the documented states to variants. [COMPONENT_MAP.md](./COMPONENT_MAP.md) provides the naming and variant structure.
5. Keep the component sheet as the source page, then publish the resulting Figma components as a library if you want to reuse them across files.

If an importer cannot access `localhost`, capture the page in the browser and paste the result into Figma, or temporarily expose the local server through a trusted tool of your choice.

## Interaction scope

This is a design reference, not an application. Only the main-card Open/Preview toggles and the two drag-resize handles are intended to behave like the Swift app. Search, project rows, editor contents, Preview contents, expand buttons, Agent controls, and Run menu actions are visual-only. The Run dropdown is included as a visible design state but does not start a build.

The panel model mirrors NTVE: Open or Preview alone occupies the trailing panel; when both are open, Open replaces the primary Home/Agent column and Preview remains on the right. The shared divider resizes both columns. Expanded panel states are documented as components, but their buttons stay inert in this visual prototype.

## Repository boundary

This folder is deliberately outside the NTVE Git repository. The source app at `/Users/pennymarshall/NTVE/NTVE` is untouched; all library files live under `/Users/pennymarshall/NTVE/ntve-figma-library`.
