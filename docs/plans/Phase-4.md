# Phase 4: Frontend Foundation - Vite React Setup

## Phase Goal

Create the foundational Vite React application with project structure, API client, routing, state management, and core UI components. This phase establishes the development environment and basic architecture for the frontend.

**Success Criteria**:
- Vite React app runs locally (`npm run dev`)
- API client successfully communicates with Lambda backend
- Environment variable configuration works
- Basic component structure is established
- State management pattern is defined
- Development build and production build both work
- CSS/styling approach is chosen and configured

**Estimated Tokens**: ~20,000

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend deployed from Phases 1-3
- API Gateway endpoint URL from backend deployment
- Basic understanding of React hooks and components
- Familiarity with Vite build tool

---

## Tasks

### Task 1: Vite Project Initialization

**Goal**: Create new Vite React project with proper configuration

**Files to Create**:
- `/frontend/` - Project directory
- `/frontend/vite.config.js` - Vite configuration
- `/frontend/package.json` - Dependencies
- `/frontend/.env.example` - Environment variable template

**Prerequisites**: Node.js installed

**Implementation Steps**:

1. Navigate to `/frontend` directory
2. Initialize Vite project:
   ```bash
   npm create vite@latest . -- --template react
   ```
   - Choose React template
   - Choose JavaScript (not TypeScript for simplicity)
3. Review generated files:
   - `index.html` - Entry HTML
   - `src/main.jsx` - Entry JavaScript
   - `src/App.jsx` - Root component
   - `vite.config.js` - Build configuration
4. Install dependencies: `npm install`
5. Create `.env.example` file:
   ```bash
   VITE_API_ENDPOINT=https://your-api-endpoint.execute-api.us-west-2.amazonaws.com
   ```
6. Update `.gitignore`:
   - Add `.env`, `.env.local`
   - Ensure `node_modules/`, `dist/` are ignored
7. Configure `vite.config.js`:
   - Set port to 3000 (or your preference)
   - Configure proxy if needed for CORS during development
   - Enable source maps for debugging

**Verification Checklist**:
- [ ] `npm run dev` starts dev server successfully
- [ ] Can access app in browser at http://localhost:3000
- [ ] Hot module replacement works (edit file, see changes)
- [ ] `npm run build` produces production bundle in `dist/`
- [ ] `.env.example` documents required environment variables

**Testing Instructions**:
- Run dev server: `npm run dev`
- Make change to `App.jsx`, verify HMR updates page
- Build production: `npm run build`
- Preview build: `npm run preview`

**Commit Message Template**:
```
chore(frontend): initialize Vite React project

- Create Vite project with React template
- Configure vite.config.js with dev server settings
- Add .env.example for environment variables
- Update .gitignore for Node.js and Vite
```

**Estimated Tokens**: ~2,000

---

### Task 2: Project Structure & Organization

**Goal**: Establish organized directory structure and file organization

**Files to Create**:
- Directory structure under `/frontend/src/`
- README.md for frontend development guide

**Prerequisites**: Task 1 complete

**Implementation Steps**:

1. Create directory structure:
   ```
   frontend/src/
   ├── api/              # API client and fetch utilities
   ├── components/       # Reusable React components
   │   ├── common/       # Generic components (buttons, inputs)
   │   ├── gallery/      # Gallery-related components
   │   └── generation/   # Image generation components
   ├── hooks/            # Custom React hooks
   ├── utils/            # Helper functions
   ├── assets/           # Images, fonts, sounds
   │   ├── images/
   │   ├── fonts/
   │   └── sounds/
   ├── styles/           # CSS files or styled-components
   ├── App.jsx           # Root component
   └── main.jsx          # Entry point
   ```

2. Create placeholder files in each directory:
   - `api/.gitkeep`
   - `components/.gitkeep`
   - `hooks/.gitkeep`
   - etc.

3. Create `frontend/README.md`:
   - Development setup instructions
   - Available npm scripts
   - Environment variable configuration
   - Component organization guidelines
   - Build and deployment instructions

4. Define coding conventions:
   - Component naming (PascalCase for components)
   - File naming (match component name)
   - Props destructuring pattern
   - Hook naming (use prefix for custom hooks)

**Verification Checklist**:
- [ ] Directory structure is created
- [ ] README.md documents development workflow
- [ ] Guidelines for code organization are clear
- [ ] All directories are committed (use .gitkeep if empty)

**Testing Instructions**:
- Navigate through directory structure, verify it's logical
- Review README.md for completeness
- Try creating a test component in each directory

**Commit Message Template**:
```
chore(frontend): establish project structure and conventions

- Create organized directory structure
- Add README.md with development guide
- Define coding conventions for components
- Add .gitkeep files for empty directories
```

**Estimated Tokens**: ~2,000

---

### Task 3: API Client Module

**Goal**: Create robust API client for communicating with Lambda backend

**Files to Create**:
- `/frontend/src/api/client.js` - Main API client
- `/frontend/src/api/config.js` - API configuration

**Prerequisites**: Task 2 complete

**Implementation Steps**:

1. Create `api/config.js`:
   - Load `VITE_API_ENDPOINT` from environment
   - Export API base URL
   - Define API routes as constants

2. Create `api/client.js` with methods:
   - `generateImages(prompt, params)` → POST /generate
   - `getJobStatus(jobId)` → GET /status/{jobId}
   - `enhancePrompt(prompt)` → POST /enhance

3. Implement fetch wrapper with error handling:
   ```javascript
   async function apiFetch(endpoint, options = {}) {
     try {
       const response = await fetch(`${API_BASE_URL}${endpoint}`, {
         ...options,
         headers: {
           'Content-Type': 'application/json',
           ...options.headers
         }
       });

       if (!response.ok) {
         // Handle HTTP errors
         const error = await response.json();
         throw new Error(error.message || `HTTP ${response.status}`);
       }

       return await response.json();
     } catch (error) {
       // Handle network errors
       console.error('API request failed:', error);
       throw error;
     }
   }
   ```

4. Implement each API method:
   - `generateImages()`: POST request with prompt and parameters
   - `getJobStatus()`: GET request with job ID in path
   - `enhancePrompt()`: POST request with prompt

5. Add request timeout (30 seconds):
   - Use AbortController for timeout
   - Throw timeout error if exceeded

6. Add retry logic for transient errors:
   - Retry 3 times with exponential backoff (1s, 2s, 4s)
   - Only retry on network errors, not HTTP errors

**Verification Checklist**:
- [ ] API client loads endpoint from environment variable
- [ ] generateImages() successfully calls backend
- [ ] getJobStatus() retrieves job status
- [ ] enhancePrompt() calls enhancement endpoint
- [ ] Error handling works (network errors, HTTP errors)
- [ ] Timeout prevents indefinite waiting
- [ ] Retry logic helps with transient failures

**Testing Instructions**:
- Unit test each method with fetch mocked
- Integration test with real backend:
  ```javascript
  import { generateImages, getJobStatus } from './api/client';

  const result = await generateImages('test prompt', {steps: 25});
  console.log('Job ID:', result.jobId);

  const status = await getJobStatus(result.jobId);
  console.log('Status:', status);
  ```
- Test error scenarios (invalid endpoint, network down)
- Test timeout (mock slow response)

**Commit Message Template**:
```
feat(frontend): implement API client for backend communication

- Create apiFetch wrapper with error handling
- Implement generateImages, getJobStatus, enhancePrompt methods
- Add request timeout (30s) with AbortController
- Add retry logic for transient errors (3 retries)
```

**Estimated Tokens**: ~4,000

---

### Task 4: Custom Hooks - Job Polling

**Goal**: Create React hook for polling job status

**Files to Create**:
- `/frontend/src/hooks/useJobPolling.js` - Job polling hook

**Prerequisites**: Task 3 complete

**Implementation Steps**:

1. Create `useJobPolling.js` custom hook:
   ```javascript
   function useJobPolling(jobId, interval = 2000) {
     const [jobStatus, setJobStatus] = useState(null);
     const [isPolling, setIsPolling] = useState(false);
     const [error, setError] = useState(null);

     useEffect(() => {
       // Polling logic
     }, [jobId, interval]);

     return { jobStatus, isPolling, error };
   }
   ```

2. Implement polling logic:
   - Start polling when jobId is provided
   - Call getJobStatus() every `interval` milliseconds
   - Update jobStatus state with response
   - Stop polling when job status is "completed", "partial", or "failed"
   - Stop polling after 5 minutes (timeout)

3. Implement cleanup:
   - Clear interval on component unmount
   - Clear interval when polling stops
   - Cancel in-flight request when component unmounts

4. Handle errors:
   - Exponential backoff on errors (2s → 4s → 8s)
   - Stop polling after 5 consecutive errors
   - Set error state for UI to display

5. Add polling state:
   - `isPolling`: Boolean indicating if currently polling
   - `jobStatus`: Latest job status object
   - `error`: Error message if polling failed

**Verification Checklist**:
- [ ] Hook starts polling when jobId is provided
- [ ] Hook stops polling when job is complete
- [ ] Hook stops polling after timeout (5 minutes)
- [ ] Hook handles errors with backoff
- [ ] Hook cleans up on unmount (no memory leaks)

**Testing Instructions**:
- Test in component:
  ```javascript
  function TestComponent() {
    const { jobStatus, isPolling, error } = useJobPolling('test-job-id');

    return (
      <div>
        <p>Polling: {isPolling ? 'Yes' : 'No'}</p>
        <p>Status: {jobStatus?.status}</p>
        <p>Error: {error}</p>
      </div>
    );
  }
  ```
- Verify polling stops when job completes
- Verify cleanup (unmount component, check no more requests)
- Monitor network tab in browser

**Commit Message Template**:
```
feat(frontend): create useJobPolling custom hook

- Implement polling logic with 2-second interval
- Stop polling on completion or 5-minute timeout
- Add exponential backoff for errors
- Clean up on unmount to prevent memory leaks
```

**Estimated Tokens**: ~3,000

---

### Task 5: Styling Setup

**Goal**: Choose and configure styling approach (CSS Modules or styled-components)

**Files to Create/Modify**:
- `/frontend/src/styles/` - Style files
- `/frontend/src/App.jsx` - Update with styles

**Prerequisites**: Task 4 complete

**Implementation Steps**:

1. Choose styling approach:
   - **Option A**: CSS Modules (built into Vite, zero config)
   - **Option B**: styled-components (requires dependency)
   - Recommendation: CSS Modules for simplicity

2. If using CSS Modules:
   - Create `src/styles/App.module.css`
   - Import in component: `import styles from './styles/App.module.css'`
   - Use: `<div className={styles.container}></div>`

3. Create global styles:
   - `src/styles/global.css`:
     ```css
     * {
       margin: 0;
       padding: 0;
       box-sizing: border-box;
     }

     body {
       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
       background-color: #1a1a1a;
       color: #ffffff;
     }

     #root {
       min-height: 100vh;
     }
     ```
   - Import in `main.jsx`

4. Set up design tokens (CSS variables):
   - Colors (primary, secondary, background, text)
   - Spacing (small, medium, large)
   - Border radius
   - Shadows
   - Store in `:root` in global.css

5. Create utility classes:
   - Flexbox utilities
   - Spacing utilities
   - Text alignment

6. Copy assets from `pixel-prompt-js`:
   - Fonts (Sigmar font)
   - Images (placeholder, error images)
   - Sounds (click, switch, swoosh)

**Verification Checklist**:
- [ ] Styling approach is configured and working
- [ ] Global styles are applied
- [ ] Design tokens (CSS variables) are defined
- [ ] Can create styled component successfully
- [ ] Assets are copied and accessible

**Testing Instructions**:
- Create test component with styles
- Verify styles are scoped (CSS Modules) or global (styled-components)
- Check design tokens in browser DevTools
- Import and use font/image assets

**Commit Message Template**:
```
feat(frontend): configure styling with CSS Modules

- Set up CSS Modules for component styling
- Create global styles with design tokens
- Define color palette and spacing system
- Copy assets from pixel-prompt-js (fonts, images, sounds)
```

**Estimated Tokens**: ~3,000

---

### Task 6: Basic UI Layout

**Goal**: Create main application layout and structure

**Files to Create**:
- `/frontend/src/App.jsx` - Main app component
- `/frontend/src/components/common/Header.jsx` - Header component
- `/frontend/src/components/common/Container.jsx` - Layout container

**Prerequisites**: Task 5 complete

**Implementation Steps**:

1. Design app layout structure:
   ```
   ┌─────────────────────────────┐
   │         Header              │
   ├─────────────────────────────┤
   │                             │
   │    Main Content Area        │
   │    (components go here)     │
   │                             │
   └─────────────────────────────┘
   ```

2. Create `Header.jsx`:
   - Display "Pixel Prompt" title
   - Show app tagline "Text-to-Image Variety Pack"
   - Apply Sigmar font to title (matching pixel-prompt-js)
   - Responsive design (different layout for mobile/desktop)

3. Create `Container.jsx`:
   - Wrapper component for main content
   - Max width (e.g., 1400px on desktop)
   - Centered on page
   - Padding for mobile

4. Update `App.jsx`:
   - Import Header and Container
   - Set up basic layout structure
   - Add placeholder for main content
   - Apply background styling (dark theme matching pixel-prompt-js)

5. Make layout responsive:
   - Mobile: Single column, full width
   - Tablet: Adjust padding and sizing
   - Desktop: Max width container, centered

**Verification Checklist**:
- [ ] Header displays correctly
- [ ] Layout is centered on desktop
- [ ] Layout is responsive (test mobile, tablet, desktop)
- [ ] Background and colors match design
- [ ] Sigmar font is applied to header

**Testing Instructions**:
- View in browser at different window sizes
- Use browser DevTools responsive mode
- Verify layout doesn't break at any width
- Check font rendering

**Commit Message Template**:
```
feat(frontend): create main application layout

- Add Header component with Pixel Prompt branding
- Create Container component for responsive layout
- Update App.jsx with layout structure
- Implement responsive design for mobile/desktop
```

**Estimated Tokens**: ~3,000

---

### Task 7: State Management Setup

**Goal**: Define state management pattern using React Context

**Files to Create**:
- `/frontend/src/context/AppContext.jsx` - Application context

**Prerequisites**: Task 6 complete

**Implementation Steps**:

1. Create `AppContext.jsx`:
   ```javascript
   import { createContext, useContext, useState } from 'react';

   const AppContext = createContext();

   export function AppProvider({ children }) {
     // Global state
     const [currentJob, setCurrentJob] = useState(null);
     const [prompt, setPrompt] = useState('');
     const [parameters, setParameters] = useState({
       steps: 28,
       guidance: 5,
       control: 1.0
     });
     const [generatedImages, setGeneratedImages] = useState(Array(9).fill(null));

     const value = {
       currentJob, setCurrentJob,
       prompt, setPrompt,
       parameters, setParameters,
       generatedImages, setGeneratedImages
     };

     return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
   }

   export function useApp() {
     const context = useContext(AppContext);
     if (!context) {
       throw new Error('useApp must be used within AppProvider');
     }
     return context;
   }
   ```

2. Wrap App with provider in `main.jsx`:
   ```javascript
   import { AppProvider } from './context/AppContext';

   ReactDOM.createRoot(document.getElementById('root')).render(
     <React.StrictMode>
       <AppProvider>
         <App />
       </AppProvider>
     </React.StrictMode>
   );
   ```

3. Define state structure:
   - `currentJob`: {jobId, status, results} or null
   - `prompt`: String
   - `parameters`: {steps, guidance, control}
   - `generatedImages`: Array of 9 image objects
   - `selectedGallery`: Gallery folder name or null

4. Create state update functions:
   - `updateJobStatus(jobStatus)`: Update current job
   - `resetGeneration()`: Clear current job and images
   - `updateParameter(key, value)`: Update single parameter

**Verification Checklist**:
- [ ] AppContext is created and provides state
- [ ] useApp hook works in components
- [ ] State updates trigger re-renders
- [ ] Error is thrown if hook used outside provider

**Testing Instructions**:
- Create test component that uses `useApp()`
- Update state and verify UI updates
- Check React DevTools for context provider
- Verify no prop drilling needed for global state

**Commit Message Template**:
```
feat(frontend): set up React Context for state management

- Create AppContext with global state
- Define state structure (job, prompt, parameters, images)
- Add useApp hook for easy context access
- Wrap App with AppProvider in main.jsx
```

**Estimated Tokens**: ~3,000

---

## Phase Verification

### Complete Phase Checklist

Before moving to Phase 5, verify:

- [ ] Vite dev server runs successfully (`npm run dev`)
- [ ] Production build works (`npm run build`)
- [ ] API client can communicate with backend
- [ ] Custom hooks work (useJobPolling)
- [ ] Styling is configured and working
- [ ] Main layout is responsive
- [ ] State management with Context is functional
- [ ] Assets (fonts, images, sounds) are accessible
- [ ] Environment variables are documented and loaded

### Integration Testing

```bash
# Start dev server
cd frontend
npm run dev

# In browser console, test API client:
import { generateImages } from './api/client';
const result = await generateImages('test', {steps: 25});
console.log(result);

# Build production
npm run build

# Preview production build
npm run preview
```

### Known Limitations

- No UI components built yet (Phase 5)
- No gallery functionality yet (Phase 6)
- No sound effects or animations yet (Phase 6)
- Placeholder content only

---

## Next Phase

Proceed to **[Phase 5: Frontend - Core Image Generation UI](Phase-5.md)** to build the main image generation interface.
