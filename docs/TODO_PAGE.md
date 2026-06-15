# Todo Page (Workspace) Implementation Details

The "Todo" page (located at `/app/todo`) has been entirely redesigned from a simple Kanban-style board into a **freeform, infinite block-based canvas** (similar to Notion combined with a whiteboard).

This document details the architecture, state management, backend interactions, and components that power this feature.

## 1. Overview & Data Model

The Workspace feature revolves around two primary Prisma models:

1. **Space**: A container/workspace for a specific topic (e.g., "Daily Planner", "Coding"). Belongs directly to a `User`.
2. **TextBox**: A floating, resizable block of text living inside a Space.
   - **`layout`** (JSON): Stores `x`, `y`, `width`, and `height` properties for different viewports (`desktop`, `tablet`, `mobile`).
   - **`content`** (JSON): Stores an array of rich-text block objects managed natively by the BlockNote editor.

_Legacy models (`Column` and `Block`) were completely migrated and removed._

---

## 2. Backend API Routes

The backend uses Express and Prisma to handle CRUD operations.

- **`GET /api/spaces`**: Fetches all spaces for the authenticated user, automatically including their nested `textBoxes`.
- **`POST /api/spaces`**: Creates a new space.
- **`GET /api/spaces/:spaceId/textboxes`**: Fetches text boxes specifically for a space.
- **`POST /api/spaces/:spaceId/textboxes`**: Spawns a new text box. Automatically assigns a default `layout` if none is provided.
- **`PATCH /api/spaces/:spaceId/textboxes/:id/layout`**: Updates the `x`, `y`, `width`, `height` coordinates when the user drags or resizes a box.
- **`PATCH /api/spaces/:spaceId/textboxes/:id/content`**: Updates the rich-text JSON content when the user types in the editor.
- **`DELETE /api/spaces/:spaceId/textboxes/:id`**: Removes a text box.

---

## 3. Frontend State Management

### **Zustand Store (`useWorkspaceStore`)**

Global UI state is intentionally kept minimal. Zustand only tracks:

- `activeSpaceId`: The currently selected Space tab.
- `focusedTextBoxId`: (Optional) Currently focused box ID.

### **React Query Hooks (`useSpaces`, `useTextBoxes`)**

All asynchronous data fetching and mutations are handled via `@tanstack/react-query`:

- Fetched data is cached globally.
- On mutations (like dragging a box), queries are automatically invalidated to seamlessly keep the UI in sync without manual refetching.

---

## 4. Frontend Component Architecture

### `app/todo/page.tsx`

The main entry point.

- Wraps the page in a `<Suspense>` boundary.
- Renders `WorkspaceInner`, which checks if the user has spaces. If none exist, it displays an onboarding UI to create their first space (e.g., "Daily Planner").
- Renders the Top Bar (`SpaceNav`) and the `WorkspaceCanvas`.

### `SpaceNav`

Renders the tabs at the top. Allows users to switch between their spaces and create new ones. Updating a tab simply updates `activeSpaceId` in the Zustand store.

### `WorkspaceCanvas`

The main infinite background.

- Fetches all `textBoxes` for the current `activeSpaceId`.
- Renders a dot-pattern background.
- Iterates over the `textBoxes` and maps them to `TextBoxContainer` components.
- Provides a floating `+` FAB (Floating Action Button) at the bottom right to spawn new text boxes.

### `TextBoxContainer`

The wrapper responsible for the **Whiteboard/Drag-and-Drop** experience.

- Uses **`react-rnd`** to make the container draggable and resizable.
- Reads initial `x, y, width, height` from the box's `layout` JSON.
- On `onDragStop` and `onResizeStop`, it triggers the `useUpdateTextBoxLayout` mutation to save the exact coordinates back to PostgreSQL.
- Provides a hoverable header containing a drag-handle (Grip icon) and a Delete button.

### `BlockEditor`

The rich-text core.

- Powered by **`@blocknote/react`** (which runs on `ProseMirror` and `Tiptap`).
- Accepts `initialContent` directly from the database.
- Provides Notion-like slash menus (`/`) out of the box (Headings, Checklists, Bullet points).
- Uses a debounced `onChange` handler to push new document state up to the server via the `useUpdateTextBoxContent` mutation.
- The `theme` prop is locked to `"dark"` to match the global application aesthetic.

---

## 5. Key Libraries Used

| Library                                | Purpose                                                            |
| -------------------------------------- | ------------------------------------------------------------------ |
| `react-rnd`                            | Resizable and Draggable component wrapper for floating text boxes. |
| `@blocknote/react` & `@blocknote/core` | Notion-style rich text editor with blocks and slash commands.      |
| `zustand`                              | Lightweight global state for tracking active tabs.                 |
| `@tanstack/react-query`                | Server state, caching, and background synchronization.             |
| `lucide-react`                         | Beautiful SVGs for UI icons.                                       |
