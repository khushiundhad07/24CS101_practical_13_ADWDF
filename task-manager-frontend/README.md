# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Practical 6: Full Stack Integration React + Node + MongoDB

## Objective

To wire the React frontend to the Node/Express/MongoDB backend into a fully functional full-stack application.

## Project Structure

- Backend: Node.js + Express + MongoDB
- Frontend: React + Vite

## Backend Setup

The backend is located in the root folder.

### Install Dependencies

```bash
npm install
```

# Practical 8: React Performance Optimization Using Lazy Loading

## Objective
To optimize the React Task Management application by implementing lazy loading and code splitting using React.lazy() and Suspense.

## Implementation

- `Projects` and `Contact` are loaded with `React.lazy()`.
- The route block is wrapped in `Suspense`.
- A meaningful loading fallback (`Loading page...`) is displayed while a route chunk loads.
- Vite generates separate JavaScript chunks for the lazy-loaded routes.

```jsx
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
```

## Before and After Comparison

Before optimization, route components were part of the initial JavaScript bundle.
After optimization, the Projects and Contact components are downloaded only when
their routes are visited.

| Metric | Before optimization | After optimization |
|---|---:|---:|
| Initial JavaScript bundle | 235.05 kB | 230.54 kB |
| Projects route code | Included in initial bundle | 4.39 kB separate chunk |
| Contact route code | Included in initial bundle | 0.26 kB separate chunk |
| Build result | Single initial bundle | Separate route chunks generated |

## Build Output After Optimization

The command `npm run build` completed successfully. The production build generated
the following JavaScript files:

| File | Size |
|---|---:|
| Main JavaScript bundle | 230.54 kB |
| Projects component chunk | 4.39 kB |
| Contact component chunk | 0.26 kB |

The optimized build completed in approximately 566 ms.

## Performance Evidence Screenshots

Add the supplied screenshots to `docs/performance/` with these names:

| Screenshot | Evidence |
|---|---|
| `before-static-import-build.png` | Baseline build with route components included in the initial bundle |
| `after-lazy-build.png` | Optimized build with separate Projects and Contact chunks |
| `network-home.png` | Home route does not request Projects or Contact chunks |
| `network-projects.png` | Projects chunk is requested when `/projects` is opened |
| `network-contact.png` | Contact chunk is requested when `/contact` is opened |
| `suspense-fallback.png` | Suspense loading UI visible during Slow 4G throttling |

These screenshots provide the before/after build, route chunk, and loading fallback
evidence required for Practical 8.

## Network and Loading Verification

- Home loads without downloading the Projects and Contact route chunks.
- The Projects chunk is requested when `/projects` is opened.
- The Contact chunk is requested when `/contact` is opened.
- The route chunks return HTTP status `200` in the browser Network tab.
- With browser throttling set to **Slow 3G**, the Suspense fallback appears before
  the selected route finishes loading.

## How to Verify

```bash
npm run build
npm run dev
```

Open the browser DevTools **Network** tab, filter by `JS`, and reload the Home
route. Then visit `/projects` and `/contact` separately to observe their chunks.
Use **Slow 3G** throttling to observe the `Loading page...` fallback.

## Result
Lazy loading was implemented successfully. The Projects and Contact components are
generated as separate JavaScript chunks and load when their respective routes are
visited. This reduces the amount of JavaScript required for the initial Home page
load and improves perceived performance.

## Conclusion
`React.lazy()` and `Suspense` implement route-based code splitting and provide a
loading fallback while a component is loading. Lazy loading delays route code
download until it is needed; it does not necessarily reduce the total code
downloaded when every route is eventually visited.
