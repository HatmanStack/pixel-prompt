# Phase 2: Complete Frontend Implementation & Testing

This phase combines all frontend work: Vite React foundation, core image generation UI, gallery features, advanced UI polish, and comprehensive testing. Complete Phase 1 (Backend) before starting this phase.

**Estimated Tokens**: ~100,000

---

## Section 1: Frontend Foundation - Vite React Setup

### Section Goal

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

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend deployed from Phase 1
- API Gateway endpoint URL from backend deployment
- Basic understanding of React hooks and components
- Familiarity with Vite build tool

---

### Tasks

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

Before moving to Section 2, verify:

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

- No UI components built yet (Section 2)
- No gallery functionality yet (Section 3)
- No sound effects or animations yet (Section 3)
- Placeholder content only

---

## Section 2: Core Image Generation UI

### Section Goal

Build the core user interface for image generation including prompt input, parameter controls, generation button, image grid display, and real-time status updates. This phase creates the primary user workflow: enter prompt → adjust parameters → generate → view results.

**Success Criteria**:
- User can enter prompts and adjust parameters (steps, guidance)
- Generate button triggers backend API call
- Loading states show progress for each model
- Image grid displays 9 images in responsive layout
- Images update in real-time as models complete
- Error states display appropriately
- UI matches design aesthetic of pixel-prompt-js
- Responsive design works on mobile and desktop

**Estimated Tokens**: ~35,000

---

### Prerequisites

- Section 1 complete (Vite app running, API client ready)
- Backend deployed and accessible
- Understanding of React hooks and state management
- Reference to pixel-prompt-js components for UX patterns

---

### Tasks

### Task 1: Prompt Input Component

**Goal**: Create prompt input field with clear button and character limit

**Files to Create**:
- `/frontend/src/components/generation/PromptInput.jsx`
- `/frontend/src/components/generation/PromptInput.module.css`

**Prerequisites**: Section 1 complete

**Implementation Steps**:

1. Create `PromptInput.jsx` component:
   - Accept props: `value`, `onChange`, `onClear`, `maxLength`
   - Render textarea for multi-line input
   - Show character count: `{value.length} / {maxLength}`
   - Include clear button (X icon)
   - Placeholder text: "Describe the image you want to generate..."

2. Implement clear functionality:
   - Clear button calls `onClear()` prop
   - Confirm before clearing if prompt is long (> 50 chars)

3. Style the component:
   - Match pixel-prompt-js aesthetic (dark theme, rounded corners)
   - Textarea auto-grows with content
   - Clear button positioned in top-right corner
   - Focus state with border highlight
   - Responsive: Full width on mobile, max-width on desktop

4. Add keyboard shortcuts:
   - Ctrl+Enter / Cmd+Enter: Trigger generation (bubble up event)
   - Escape: Clear input

5. Handle edge cases:
   - Empty prompt → disable generate button
   - Exceeding max length → prevent typing
   - Copy/paste large text → truncate to max length

**Verification Checklist**:
- [ ] Component renders with placeholder text
- [ ] Typing updates character count
- [ ] Clear button empties input
- [ ] Max length enforced
- [ ] Styles match design aesthetic
- [ ] Responsive on mobile and desktop
- [ ] Keyboard shortcuts work

**Testing Instructions**:
- Type various prompts and verify character count
- Test clear button with short and long prompts
- Try to exceed max length (500 chars)
- Test on mobile width (textarea should be full width)
- Verify keyboard shortcuts

**Commit Message Template**:
```
feat(frontend): create prompt input component

- Add textarea with character count
- Implement clear button with confirmation
- Add keyboard shortcuts (Ctrl+Enter, Escape)
- Style with dark theme aesthetic
- Make responsive for mobile/desktop
```

**Estimated Tokens**: ~4,000

---

### Task 2: Parameter Sliders Component

**Goal**: Create sliders for adjusting generation parameters (steps, guidance)

**Files to Create**:
- `/frontend/src/components/generation/ParameterSliders.jsx`
- `/frontend/src/components/generation/ParameterSliders.module.css`

**Prerequisites**: Task 1 complete, reference `/pixel-prompt-js/components/Slider.js`

**Implementation Steps**:

1. Create `ParameterSliders.jsx` component:
   - Accept props: `steps`, `guidance`, `onStepsChange`, `onGuidanceChange`
   - Render two sliders with labels

2. Implement Steps slider:
   - Label: "Sampling Steps"
   - Range: 3 to 50
   - Default: 28
   - Show current value next to label
   - Tooltip explaining what steps do (optional)

3. Implement Guidance slider:
   - Label: "Guidance Scale"
   - Range: 0 to 10
   - Default: 5
   - Show current value (with 1 decimal place)
   - Tooltip explaining what guidance does (optional)

4. Style sliders:
   - Custom styled range input (not browser default)
   - Filled track (shows progress)
   - Large thumb for easy dragging
   - Value display updates in real-time
   - Mobile: Full width, larger touch targets

5. Add snap behavior (optional):
   - Steps: Snap to integers (no decimals)
   - Guidance: Snap to 0.5 increments

**Verification Checklist**:
- [ ] Both sliders render with correct ranges
- [ ] Value display updates as slider moves
- [ ] onChange callbacks fire with correct values
- [ ] Sliders look good (custom styled, not browser default)
- [ ] Mobile-friendly (large touch targets)

**Testing Instructions**:
- Drag sliders and verify values update
- Test min and max values
- Verify callbacks receive correct values
- Test on mobile (touch dragging)
- Compare styling to pixel-prompt-js sliders

**Commit Message Template**:
```
feat(frontend): create parameter sliders component

- Add Steps slider (3-50, default 28)
- Add Guidance slider (0-10, default 5)
- Custom styled sliders with filled track
- Real-time value display
- Mobile-optimized with large touch targets
```

**Estimated Tokens**: ~4,000

---

### Task 3: Generate Button Component

**Goal**: Create main generation button with loading states

**Files to Create**:
- `/frontend/src/components/generation/GenerateButton.jsx`
- `/frontend/src/components/generation/GenerateButton.module.css`

**Prerequisites**: Task 2 complete

**Implementation Steps**:

1. Create `GenerateButton.jsx` component:
   - Accept props: `onClick`, `isGenerating`, `disabled`, `label`
   - Render button with dynamic text and state

2. Implement button states:
   - Default: "Generate Images" (idle)
   - Generating: "Generating..." with spinner
   - Disabled: Grayed out, not clickable
   - Error: "Try Again" (after error)

3. Add loading spinner:
   - CSS-only spinner (rotating circle)
   - Shown when `isGenerating` is true
   - Positioned next to button text

4. Style the button:
   - Large, prominent button
   - Gradient background (eye-catching)
   - Hover and active states
   - Disabled state (reduced opacity)
   - Responsive: Full width on mobile, auto width on desktop

5. Add click handling:
   - Call `onClick()` prop when clicked
   - Prevent click when disabled or generating
   - Visual feedback (press effect)

6. Accessibility:
   - Proper aria-label
   - Disabled attribute when not clickable
   - Focus state (keyboard navigation)

**Verification Checklist**:
- [ ] Button renders with correct text
- [ ] Loading spinner appears when generating
- [ ] Disabled state prevents clicks
- [ ] Click handler is called when clicked
- [ ] Styles are visually appealing
- [ ] Responsive design works
- [ ] Accessible (keyboard navigation, screen readers)

**Testing Instructions**:
- Click button and verify onClick fires
- Set isGenerating=true and verify spinner appears
- Set disabled=true and verify button is not clickable
- Test keyboard navigation (Tab to focus, Enter to click)
- Test on mobile (button should be easy to tap)

**Commit Message Template**:
```
feat(frontend): create generate button with loading states

- Add button with idle, generating, and disabled states
- Implement CSS spinner for loading indication
- Style with gradient background and hover effects
- Make responsive and accessible
- Add keyboard navigation support
```

**Estimated Tokens**: ~3,500

---

### Task 4: Image Grid Component

**Goal**: Create responsive grid to display 9 generated images

**Files to Create**:
- `/frontend/src/components/generation/ImageGrid.jsx`
- `/frontend/src/components/generation/ImageGrid.module.css`
- `/frontend/src/components/generation/ImageCard.jsx`

**Prerequisites**: Task 3 complete, reference `/pixel-prompt-js/components/NewImage.js`

**Implementation Steps**:

1. Create `ImageCard.jsx` component (individual image):
   - Props: `image`, `model`, `status`, `onExpand`
   - Render image or loading placeholder
   - Show model name as label
   - Display status (loading, completed, error)

2. Implement loading states:
   - Placeholder: Gray box with pulsing animation
   - Loading: Spinner overlay
   - Completed: Full image displayed
   - Error: Error icon with message

3. Create `ImageGrid.jsx` component (grid layout):
   - Props: `images` (array of 9 image objects)
   - Render 9 ImageCard components in grid
   - Grid layout: 3x3 on desktop, 2x2 or 1x1 on mobile

4. Style the grid:
   - CSS Grid layout
   - Equal-sized cells with aspect ratio 1:1
   - Gap between images
   - Responsive breakpoints:
     - Mobile (< 600px): 2 columns
     - Tablet (600-1000px): 3 columns
     - Desktop (> 1000px): 3-4 columns

5. Implement progressive loading:
   - Initially show 9 placeholders
   - As images complete, replace placeholders
   - Smooth transition (fade in)

6. Add image expansion (click to enlarge):
   - Click image → show full-size modal
   - Close button or click outside to dismiss
   - Arrow keys to navigate between images

**Verification Checklist**:
- [ ] Grid displays 9 cells
- [ ] Placeholder animation works
- [ ] Images fade in when loaded
- [ ] Model names are displayed correctly
- [ ] Error states show error icon
- [ ] Grid is responsive (different columns on mobile/desktop)
- [ ] Click to expand works
- [ ] Keyboard navigation works in expanded view

**Testing Instructions**:
- Render with mock data (9 loading states)
- Simulate images completing one by one
- Verify smooth transitions
- Test on mobile (grid should adjust)
- Click image to expand, verify modal works
- Test error state (missing image)

**Commit Message Template**:
```
feat(frontend): create image grid with progressive loading

- Add ImageCard component for individual images
- Create ImageGrid with responsive 3x3 layout
- Implement loading placeholders with animation
- Add fade-in effect as images load
- Support click-to-expand functionality
- Make responsive (2x2 mobile, 3x3 desktop)
```

**Estimated Tokens**: ~5,000

---

### Task 5: Generation Workflow Integration

**Goal**: Connect all components and implement end-to-end generation workflow

**Files to Create/Modify**:
- `/frontend/src/components/generation/GenerationPanel.jsx` - Main panel component
- `/frontend/src/App.jsx` - Update to include GenerationPanel

**Prerequisites**: Tasks 1-4 complete

**Implementation Steps**:

1. Create `GenerationPanel.jsx` container component:
   - Import all generation components
   - Use `useApp()` hook for global state
   - Use `useJobPolling()` hook for status updates
   - Manage local state for UI interactions

2. Implement generation workflow:
   - User enters prompt → update state
   - User adjusts parameters → update state
   - User clicks generate:
     - Call API client `generateImages()`
     - Get job ID from response
     - Start polling with `useJobPolling(jobId)`
     - Update UI to show generating state
   - As job status updates:
     - Extract image URLs from results
     - Convert base64 to blob URLs
     - Update image grid with completed images
   - When job completes:
     - Stop polling
     - Show completion message
     - Enable new generation

3. Handle errors:
   - API error → show error message, allow retry
   - Rate limit → show specific message with countdown
   - Content filter → show warning about prompt
   - Network error → show connection error, allow retry

4. Implement state management:
   - Track current job ID
   - Track generation status (idle, generating, completed, error)
   - Track individual image statuses
   - Track error messages

5. Add user feedback:
   - Progress indicator (X/9 models complete)
   - Estimated time remaining (optional)
   - Success message when complete
   - Error messages with helpful actions

**Verification Checklist**:
- [ ] Workflow executes correctly (prompt → generate → display)
- [ ] Polling starts when job is created
- [ ] Images appear as models complete
- [ ] Polling stops when job is complete
- [ ] Errors are handled and displayed
- [ ] Can start new generation after completion
- [ ] Progress indicator shows accurate count

**Testing Instructions**:
- Full workflow test:
  1. Enter prompt "beautiful sunset"
  2. Adjust steps to 25, guidance to 7
  3. Click generate
  4. Verify API call is made
  5. Verify polling starts
  6. Watch images appear one by one
  7. Verify polling stops when complete
- Test error scenarios:
  - Backend down → show error
  - Rate limited → show limit message
  - Invalid prompt → show filter warning
- Test rapid successive generations
- Monitor network tab for API calls

**Commit Message Template**:
```
feat(frontend): integrate generation workflow

- Create GenerationPanel container component
- Connect all generation components
- Implement end-to-end generation flow
- Add polling for real-time status updates
- Handle errors with user-friendly messages
- Display progress indicator (X/9 complete)
```

**Estimated Tokens**: ~6,000

---

### Task 6: Real-time Image Updates

**Goal**: Implement efficient image loading and display as models complete

**Files to Create**:
- `/frontend/src/hooks/useImageLoader.js` - Image loading hook
- `/frontend/src/utils/imageHelpers.js` - Image utility functions

**Prerequisites**: Task 5 complete

**Implementation Steps**:

1. Create `imageHelpers.js` with utility functions:
   - `base64ToBlob(base64, mimeType)` → converts base64 to Blob
   - `createBlobUrl(blob)` → creates object URL from Blob
   - `revokeBlobUrl(url)` → revokes object URL (cleanup)
   - `fetchImageFromS3(s3Key, cloudFrontDomain)` → fetches image JSON

2. Create `useImageLoader.js` hook:
   - Accept: `jobStatus` (job status object from polling)
   - Return: `images` (array of 9 image objects with URLs)
   - Track blob URLs for cleanup

3. Implement loading logic:
   - When job status updates:
     - For each completed model in results:
       - Fetch image JSON from S3 (using imageKey)
       - Extract base64 image
       - Convert to blob URL
       - Store in images array at correct index
     - For in-progress models:
       - Show loading state
     - For errored models:
       - Show error state

4. Implement cleanup:
   - On unmount: Revoke all blob URLs
   - On new generation: Revoke old blob URLs before starting
   - Prevent memory leaks

5. Optimize performance:
   - Only fetch images that haven't been fetched yet
   - Cache fetched images (don't re-fetch)
   - Use Promise.all for parallel fetches (if multiple complete at once)

6. Handle S3/CloudFront fetch:
   - Build CloudFront URL from image key
   - Fetch JSON from CloudFront (faster than S3)
   - Parse JSON and extract base64 image
   - Handle fetch errors (retry once)

**Verification Checklist**:
- [ ] Images load as models complete (real-time)
- [ ] Blob URLs are created correctly
- [ ] Images display in browser
- [ ] Cleanup prevents memory leaks
- [ ] Only fetches new images (not duplicates)
- [ ] Handles fetch errors gracefully

**Testing Instructions**:
- Generate images and watch them load one by one
- Check browser memory (DevTools Performance tab) for leaks
- Verify blob URLs are revoked on unmount
- Test rapid successive generations (cleanup between)
- Monitor network tab (should see CloudFront requests)
- Test error handling (invalid S3 key)

**Commit Message Template**:
```
feat(frontend): implement real-time image loading

- Create useImageLoader hook for progressive image display
- Add imageHelpers for base64/blob conversion
- Fetch images from CloudFront as models complete
- Implement blob URL cleanup to prevent memory leaks
- Optimize with caching and parallel fetches
```

**Estimated Tokens**: ~5,000

---

### Task 7: Prompt Enhancement UI

**Goal**: Add button and UI for prompt enhancement feature

**Files to Create**:
- `/frontend/src/components/generation/PromptEnhancer.jsx`
- `/frontend/src/components/generation/PromptEnhancer.module.css`

**Prerequisites**: Task 6 complete

**Implementation Steps**:

1. Create `PromptEnhancer.jsx` component:
   - Button: "Enhance Prompt" with magic wand icon
   - Shows loading state when enhancing
   - Displays enhanced prompt result

2. Implement enhancement workflow:
   - User clicks "Enhance" button
   - Call API client `enhancePrompt(currentPrompt)`
   - Show loading spinner
   - When response received:
     - Display enhanced prompt
     - Option to use enhanced prompt or keep original
     - Toggle between short and long versions (if available)

3. Add UI for enhanced prompt:
   - Display area below input
   - Show original vs enhanced (comparison)
   - Buttons: "Use This" and "Discard"
   - Toggle switch: "Short" / "Long" version

4. Integrate with PromptInput:
   - Position enhance button near prompt input
   - When "Use This" clicked, update prompt in input
   - When "Discard" clicked, hide enhanced prompt

5. Handle edge cases:
   - Empty prompt → disable enhance button
   - API error → show error message
   - Very long enhanced prompt → truncate with "Read More"

**Verification Checklist**:
- [ ] Enhance button is visible and clickable
- [ ] Loading state shows during API call
- [ ] Enhanced prompt is displayed correctly
- [ ] "Use This" updates the prompt input
- [ ] "Discard" hides the enhanced prompt
- [ ] Toggle between short/long versions works
- [ ] Errors are handled gracefully

**Testing Instructions**:
- Enter short prompt "cat"
- Click "Enhance"
- Verify API call to /enhance endpoint
- Verify enhanced prompt is displayed
- Click "Use This" and verify input updates
- Test toggle between short/long
- Test with empty prompt (button should be disabled)
- Test error handling (backend down)

**Commit Message Template**:
```
feat(frontend): add prompt enhancement feature

- Create PromptEnhancer component with enhance button
- Call backend /enhance endpoint
- Display original vs enhanced prompt comparison
- Add "Use This" and "Discard" actions
- Support short/long prompt toggle
- Handle errors and edge cases
```

**Estimated Tokens**: ~4,000

---

### Task 8: Polish and UX Improvements

**Goal**: Add polish, animations, and UX improvements to generation flow

**Files to Modify**:
- All generation components
- CSS files

**Prerequisites**: Tasks 1-7 complete

**Implementation Steps**:

1. Add loading animations:
   - Skeleton loader for placeholders (pulsing effect)
   - Spinner animations (smooth rotation)
   - Image fade-in transitions

2. Add success feedback:
   - Completion message: "All images generated!"
   - Success animation (checkmark, confetti, etc.)
   - Sound effect on completion (optional)

3. Improve error messages:
   - User-friendly error text (not technical jargon)
   - Actionable suggestions ("Check your connection", "Try again")
   - Dismiss button for errors

4. Add empty states:
   - Initial state: "Enter a prompt to get started"
   - Placeholder images in grid
   - Helpful tips or examples

5. Optimize performance:
   - Lazy load image grid (don't render until needed)
   - Debounce parameter changes (prevent rapid updates)
   - Memoize components with React.memo

6. Accessibility improvements:
   - Screen reader announcements for status changes
   - Keyboard navigation for all controls
   - Focus management (auto-focus prompt after generation)
   - ARIA labels for all interactive elements

7. Mobile optimizations:
   - Touch-friendly targets (min 44px)
   - Prevent zoom on input focus
   - Optimize layout for small screens
   - Reduce animations on low-power devices

**Verification Checklist**:
- [ ] Animations are smooth and not janky
- [ ] Success feedback is clear and satisfying
- [ ] Error messages are helpful
- [ ] Empty states guide the user
- [ ] Performance is good (no lag)
- [ ] Accessible via keyboard and screen reader
- [ ] Works well on mobile devices

**Testing Instructions**:
- Complete full generation flow, note any rough edges
- Test on slow network (throttle in DevTools)
- Test with screen reader (VoiceOver, NVDA)
- Test keyboard-only navigation
- Test on actual mobile device
- Verify animations are smooth (60fps)
- Run Lighthouse audit for performance and accessibility

**Commit Message Template**:
```
feat(frontend): polish generation UI with animations and accessibility

- Add skeleton loaders and fade-in animations
- Implement success feedback with completion message
- Improve error messages with actionable suggestions
- Add empty states with helpful guidance
- Optimize performance with memoization
- Enhance accessibility (ARIA, keyboard navigation)
- Mobile optimizations (touch targets, layout)
```

**Estimated Tokens**: ~3,500

---

## Phase Verification

### Complete Phase Checklist

Before moving to Section 3, verify:

- [ ] Prompt input works with character count and clear button
- [ ] Parameter sliders adjust steps and guidance
- [ ] Generate button triggers generation workflow
- [ ] Image grid displays 9 images in responsive layout
- [ ] Images load progressively as models complete
- [ ] Job polling updates UI in real-time
- [ ] Errors are handled and displayed
- [ ] Prompt enhancement feature works
- [ ] UI is polished with animations
- [ ] Accessible and mobile-friendly

### End-to-End Testing

**Test Scenario 1: Successful Generation**
1. Open app in browser
2. Enter prompt: "a majestic mountain landscape at sunset"
3. Adjust steps to 30, guidance to 6
4. Click "Generate Images"
5. Verify:
   - Button shows "Generating..." with spinner
   - Image grid shows 9 placeholders with loading animation
   - Progress indicator shows "0/9 complete"
6. Wait and observe:
   - Images appear one by one as models complete
   - Progress updates (1/9, 2/9, ..., 9/9)
   - Model names are displayed on each image
7. When complete:
   - All 9 images are displayed
   - Button returns to "Generate Images"
   - Success message shown

**Test Scenario 2: Error Handling**
1. Disconnect internet
2. Try to generate
3. Verify error message about connection
4. Reconnect internet
5. Click "Try Again"
6. Verify generation works

**Test Scenario 3: Prompt Enhancement**
1. Enter short prompt: "dog"
2. Click "Enhance Prompt"
3. Verify enhanced prompt is displayed
4. Toggle between short/long versions
5. Click "Use This"
6. Verify prompt input is updated

### Performance Benchmarks

- Prompt input: No lag while typing
- Parameter sliders: Smooth dragging (60fps)
- Image grid: Smooth fade-in transitions
- Generate button: Immediate response to click
- Polling: 2-second interval without UI lag
- Memory: No leaks (blob URLs cleaned up)

### Known Limitations

- No gallery feature yet (Section 3)
- No sound effects yet (Section 3)
- No advanced animations (breathing background) yet (Section 3)
- Limited customization options

---

## Section 3: Gallery & Advanced Features

### Section Goal

Implement the gallery feature for browsing historical generations, add sound effects for user interactions, create the breathing background animation, and add final polish features to match the full feature parity of pixel-prompt-js.

**Success Criteria**:
- Gallery displays previews of all past generations
- User can click a gallery preview to load all 9 images from that session
- Sound effects play on button clicks and interactions
- Breathing background animation runs continuously
- Expandable sections work correctly
- All features from pixel-prompt-js are replicated
- UI is polished and production-ready

**Estimated Tokens**: ~40,000

---

### Prerequisites

- Section 2 complete (core generation UI working)
- Sound files copied to frontend/assets/sounds/
- Reference components from pixel-prompt-js

---

### Tasks

### Task 1: Gallery Module - S3 Listing

**Goal**: Create module to list and fetch gallery items from S3

**Files to Create**:
- `/frontend/src/hooks/useGallery.js` - Gallery data hook
- `/frontend/src/utils/s3Helpers.js` - S3 listing utilities

**Prerequisites**: Section 2 complete

**Implementation Steps**:

1. Create `s3Helpers.js` with S3 listing functions:
   - `listGalleryFolders(s3Client)` → returns list of folders
   - `listGalleryImages(s3Client, folder)` → returns images in folder
   - Use S3 SDK (install `@aws-sdk/client-s3` if using browser SDK)
   - Alternative: Create Lambda endpoint `/gallery/list` and use API client

2. Note: Browser cannot directly access S3 (CORS, credentials)
   - Recommended approach: Add Lambda endpoints for gallery listing
   - Or: Use pre-signed URLs generated by backend
   - Or: List via CloudFront with S3 XML listing enabled

3. Create `useGallery.js` hook:
   ```javascript
   function useGallery() {
     const [galleries, setGalleries] = useState([]);
     const [selectedGallery, setSelectedGallery] = useState(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);

     const fetchGalleries = async () => {
       // Fetch list of gallery folders
     };

     const loadGallery = async (galleryId) => {
       // Fetch all images from gallery
     };

     return { galleries, selectedGallery, loading, error, fetchGalleries, loadGallery };
   }
   ```

4. Implement `fetchGalleries()`:
   - Call backend endpoint (new: `GET /gallery/list`)
   - Returns array of gallery folders: `[{id: "2025-11-15-14-30-45", preview: "..."}]`
   - For each folder, get one random image as preview
   - Store in state

5. Implement `loadGallery(galleryId)`:
   - Call backend endpoint (new: `GET /gallery/{galleryId}`)
   - Returns all images from that folder
   - Parse and convert to display format
   - Update selectedGallery state

6. Add backend endpoints (in Lambda):
   - `GET /gallery/list`: List all folders, return with preview images
   - `GET /gallery/{galleryId}`: Return all images from folder

**Verification Checklist**:
- [ ] useGallery hook fetches galleries successfully
- [ ] Gallery list includes preview images
- [ ] loadGallery fetches all images from selected gallery
- [ ] Backend endpoints work correctly
- [ ] Error handling for failed fetches

**Testing Instructions**:
- Create test generations to populate gallery
- Call fetchGalleries() and verify list returned
- Call loadGallery() and verify images returned
- Test with empty gallery (no generations yet)
- Test error handling (backend down)

**Commit Message Template**:
```
feat(frontend): implement gallery data fetching

- Create useGallery hook for gallery management
- Add s3Helpers for S3 operations
- Implement fetchGalleries and loadGallery functions
- Add backend endpoints for gallery listing
- Handle errors and loading states
```

**Estimated Tokens**: ~5,000

---

### Task 2: Gallery UI Component

**Goal**: Create gallery UI for browsing and selecting past generations

**Files to Create**:
- `/frontend/src/components/gallery/GalleryBrowser.jsx`
- `/frontend/src/components/gallery/GalleryBrowser.module.css`
- `/frontend/src/components/gallery/GalleryPreview.jsx`

**Prerequisites**: Task 1 complete, reference `/pixel-prompt-js/components/ImageGrid.js`

**Implementation Steps**:

1. Create `GalleryPreview.jsx` component:
   - Props: `gallery` (object with id, preview image, date)
   - Render preview image in card
   - Show date/timestamp
   - Clickable to load full gallery
   - Hover effect (scale up slightly)

2. Create `GalleryBrowser.jsx` component:
   - Use `useGallery()` hook
   - Display grid of GalleryPreview components
   - Show loading state while fetching
   - Show empty state if no galleries

3. Implement gallery selection:
   - Click preview → call `loadGallery(galleryId)`
   - Show loading overlay
   - When loaded, display all 9 images in main image grid
   - Highlight selected gallery in browser

4. Layout the gallery browser:
   - Horizontal scrollable row of previews (like film strip)
   - Or grid layout if many galleries
   - Position: Below main controls, above image grid
   - Collapsible: Can hide gallery browser to save space

5. Add pagination (if many galleries):
   - Show 10-20 galleries at a time
   - "Load More" button
   - Or infinite scroll

6. Style the gallery browser:
   - Preview cards with border and shadow
   - Selected state (highlight border)
   - Responsive: Horizontal scroll on mobile, grid on desktop

**Verification Checklist**:
- [ ] Gallery browser displays previews
- [ ] Click preview loads full gallery
- [ ] Selected gallery is highlighted
- [ ] Loading states work
- [ ] Empty state shows when no galleries
- [ ] Responsive design works

**Testing Instructions**:
- Generate several images to create galleries
- Open gallery browser and verify previews shown
- Click preview and verify all 9 images load
- Test with many galleries (pagination/scroll)
- Test on mobile (horizontal scroll)
- Verify loading and empty states

**Commit Message Template**:
```
feat(frontend): create gallery browser UI

- Add GalleryPreview component for individual galleries
- Create GalleryBrowser with grid/scroll layout
- Implement gallery selection and loading
- Add loading and empty states
- Style with responsive design
```

**Estimated Tokens**: ~5,000

---

### Task 3: Sound Effects Module

**Goal**: Add sound effects for user interactions

**Files to Create**:
- `/frontend/src/hooks/useSound.js` - Sound playback hook
- `/frontend/src/components/common/SoundPlayer.jsx` - Sound player component

**Prerequisites**: Task 2 complete, reference `/pixel-prompt-js/components/Sounds.js`

**Implementation Steps**:

1. Copy sound files to `/frontend/src/assets/sounds/`:
   - `click.wav` - Button click sound
   - `switch.wav` - Toggle switch sound
   - `swoosh.wav` - Transition sound
   - `expand.mp3` - Expand section sound

2. Create `useSound.js` hook:
   ```javascript
   function useSound() {
     const [sounds, setSounds] = useState({});

     useEffect(() => {
       // Preload sounds
       const audio = {
         click: new Audio('/assets/sounds/click.wav'),
         switch: new Audio('/assets/sounds/switch.wav'),
         swoosh: new Audio('/assets/sounds/swoosh.wav'),
         expand: new Audio('/assets/sounds/expand.mp3')
       };
       setSounds(audio);
     }, []);

     const playSound = (soundName) => {
       if (sounds[soundName]) {
         sounds[soundName].currentTime = 0; // Reset to start
         sounds[soundName].play().catch(err => console.log('Sound play failed:', err));
       }
     };

     return { playSound };
   }
   ```

3. Create `SoundPlayer.jsx` component:
   - Accept props: `soundToPlay` (name of sound)
   - Use `useSound()` hook
   - Play sound when `soundToPlay` changes
   - Handle autoplay restrictions (user must interact first)

4. Integrate sounds into components:
   - Generate button click: Play "click" sound
   - Parameter slider change: Play "switch" sound
   - Gallery preview click: Play "swoosh" sound
   - Expand/collapse sections: Play "expand" sound

5. Add mute toggle:
   - Button to mute/unmute sounds
   - Store preference in localStorage
   - Respect user preference on page load

6. Handle browser autoplay restrictions:
   - Sounds only work after user interaction
   - Show notice if autoplay blocked
   - Graceful fallback (no crash if sound fails)

**Verification Checklist**:
- [ ] Sounds preload on app mount
- [ ] playSound() plays correct sound
- [ ] Sounds play on button clicks
- [ ] Sounds play on slider changes
- [ ] Mute toggle works and persists
- [ ] No errors if sound playback fails

**Testing Instructions**:
- Click generate button, verify click sound
- Move sliders, verify switch sound
- Click gallery preview, verify swoosh sound
- Toggle mute and verify sounds stop
- Refresh page and verify mute preference persists
- Test in browser with strict autoplay policy (check console for errors)

**Commit Message Template**:
```
feat(frontend): add sound effects for interactions

- Create useSound hook for sound playback
- Add SoundPlayer component
- Integrate sounds (click, switch, swoosh, expand)
- Add mute toggle with localStorage persistence
- Handle browser autoplay restrictions gracefully
```

**Estimated Tokens**: ~4,000

---

### Task 4: Breathing Background Animation

**Goal**: Create subtle breathing background animation

**Files to Create**:
- `/frontend/src/components/common/BreathingBackground.jsx`
- `/frontend/src/components/common/BreathingBackground.module.css`

**Prerequisites**: Task 3 complete, reference `/pixel-prompt-js/components/Breathing.js`

**Implementation Steps**:

1. Create `BreathingBackground.jsx` component:
   - Renders full-screen background layer
   - Animated gradient or color shift
   - Subtle pulsing effect (scale or opacity)

2. Implement animation:
   - Use CSS animations or React Animated (prefer CSS for performance)
   - Keyframes for breathing effect:
     ```css
     @keyframes breathe {
       0%, 100% { transform: scale(1); opacity: 0.5; }
       50% { transform: scale(1.05); opacity: 0.7; }
     }
     ```
   - Duration: 6-8 seconds (slow, calm breathing)
   - Infinite loop

3. Style the background:
   - Position: fixed, full viewport
   - Z-index: -1 (behind all content)
   - Gradient: Subtle dark colors (purple, blue, black)
   - Blur or filter effects for atmosphere

4. Optimize performance:
   - Use `will-change: transform` for GPU acceleration
   - Avoid animating expensive properties (e.g., box-shadow)
   - Test on low-end devices (disable if laggy)

5. Add toggle:
   - User preference to disable animation
   - Store in localStorage
   - Some users may find animation distracting

**Verification Checklist**:
- [ ] Background animation is visible
- [ ] Animation is smooth (60fps)
- [ ] Doesn't interfere with content readability
- [ ] Performance is good (no lag)
- [ ] Toggle works to disable animation

**Testing Instructions**:
- View app and observe background breathing
- Verify smooth animation (no stuttering)
- Test on low-end device or throttle CPU
- Toggle animation off and verify it stops
- Verify content is still readable with animation

**Commit Message Template**:
```
feat(frontend): add breathing background animation

- Create BreathingBackground component
- Implement CSS keyframe animation (6s loop)
- Style with subtle gradient and pulsing effect
- Optimize with GPU acceleration
- Add toggle to disable animation
```

**Estimated Tokens**: ~3,500

---

### Task 5: Expandable Sections Component

**Goal**: Create collapsible sections for organizing UI

**Files to Create**:
- `/frontend/src/components/common/Expand.jsx`
- `/frontend/src/components/common/Expand.module.css`

**Prerequisites**: Task 4 complete, reference `/pixel-prompt-js/components/Expand.js`

**Implementation Steps**:

1. Create `Expand.jsx` component:
   - Props: `title`, `children`, `defaultExpanded`, `onToggle`
   - Renders header with title and expand/collapse icon
   - Renders children (content) when expanded
   - Smooth height transition when toggling

2. Implement expand/collapse:
   - State: `isExpanded` (boolean)
   - Click header → toggle state
   - Animate height transition (CSS transition)
   - Rotate icon (arrow or chevron)

3. Handle animations:
   - Expanding: Height 0 → auto (with transition)
   - Collapsing: Height auto → 0
   - Icon rotation: 0deg → 180deg
   - Use CSS transition for smooth effect

4. Add sound effect:
   - Play "expand" sound on toggle
   - Use `useSound()` hook

5. Style the component:
   - Header: Button-like, clickable
   - Icon: Arrow or chevron that rotates
   - Content: Padded, smooth reveal
   - Responsive: Full width on mobile

6. Accessibility:
   - Proper ARIA attributes (aria-expanded)
   - Keyboard navigation (Enter/Space to toggle)
   - Focus state on header

**Verification Checklist**:
- [ ] Section expands and collapses smoothly
- [ ] Icon rotates on toggle
- [ ] Sound plays on toggle
- [ ] Keyboard accessible (Enter/Space)
- [ ] ARIA attributes are correct
- [ ] Multiple instances work independently

**Testing Instructions**:
- Create component with test content
- Click header and verify smooth expand
- Click again and verify collapse
- Test keyboard navigation
- Test with multiple Expand components on page
- Verify sound plays on toggle

**Commit Message Template**:
```
feat(frontend): create expandable sections component

- Add Expand component with smooth height transition
- Implement expand/collapse with icon rotation
- Add sound effect on toggle
- Make keyboard accessible
- Style with responsive design
```

**Estimated Tokens**: ~4,000

---

### Task 6: Advanced UI Features

**Goal**: Add remaining features for full parity with pixel-prompt-js

**Files to Create/Modify**:
- Various components as needed

**Prerequisites**: Tasks 1-5 complete

**Implementation Steps**:

1. Add model-specific status indicators:
   - Show which models are currently processing
   - Color-coded status (pending, in-progress, complete, error)
   - Progress bar for overall completion

2. Implement image expansion modal:
   - Click image → open full-screen modal
   - Show large version of image
   - Display model name, prompt, parameters
   - Navigation arrows to view other images
   - Close button or click outside to dismiss
   - Keyboard shortcuts (Esc to close, arrows to navigate)

3. Add prompt examples/seeds:
   - Button: "Random Prompt" or "Example"
   - Loads random prompt from seeds.json (copy from pixel-prompt-js)
   - Helps users get started

4. Implement parameters preset:
   - Quick buttons: "Fast" (low steps), "Quality" (high steps), "Creative" (high guidance)
   - One-click to set multiple parameters

5. Add copy-to-clipboard:
   - Button to copy prompt
   - Button to copy parameters
   - Toast notification on copy

6. Implement download images:
   - Download button on each image
   - Downloads as PNG with metadata
   - Filename: `{model}-{timestamp}.png`

7. Add keyboard shortcuts:
   - Ctrl+Enter: Generate
   - Ctrl+E: Enhance prompt
   - Ctrl+R: Random prompt
   - Esc: Clear/cancel
   - Show shortcut hints (tooltip or help modal)

**Verification Checklist**:
- [ ] Model status indicators show correctly
- [ ] Image expansion modal works
- [ ] Random prompt button works
- [ ] Parameter presets apply correctly
- [ ] Copy-to-clipboard works with toast
- [ ] Download images works
- [ ] Keyboard shortcuts work
- [ ] All features are accessible

**Testing Instructions**:
- Test each feature individually
- Verify keyboard shortcuts
- Test copy and download
- Test modal navigation
- Verify all features work on mobile
- Check accessibility with screen reader

**Commit Message Template**:
```
feat(frontend): add advanced UI features

- Add model-specific status indicators
- Implement image expansion modal with navigation
- Add random prompt button with seeds
- Create parameter presets (fast, quality, creative)
- Add copy-to-clipboard with toast notifications
- Implement download images feature
- Add keyboard shortcuts and hints
```

**Estimated Tokens**: ~6,000

---

### Task 7: Mobile Optimizations

**Goal**: Optimize UI and UX for mobile devices

**Files to Modify**:
- All component CSS files
- App layout

**Prerequisites**: Task 6 complete

**Implementation Steps**:

1. Review mobile layout:
   - Test on actual devices (iOS, Android)
   - Identify layout issues, overflow, tiny text, etc.
   - Use browser DevTools device emulation

2. Optimize touch targets:
   - All buttons: Min 44x44px
   - Sliders: Larger thumb (min 44px)
   - Gallery previews: Larger for easier tapping

3. Adjust font sizes:
   - Ensure text is readable (min 16px body text)
   - Headers scale appropriately
   - No tiny text

4. Fix overflow and scrolling:
   - Horizontal scroll only where intended (gallery)
   - Prevent accidental horizontal scroll
   - Proper overflow handling in modals

5. Optimize animations:
   - Reduce or disable heavy animations on mobile
   - Use `prefers-reduced-motion` media query
   - Prioritize performance over aesthetics

6. Handle mobile keyboards:
   - Prevent input zoom (font-size: 16px min)
   - Proper input types (text, number)
   - Smooth scroll when keyboard appears

7. Test gestures:
   - Swipe to navigate images in modal
   - Pull to refresh (disable if conflicts)
   - Pinch to zoom on images (enable)

8. Optimize for slow networks:
   - Show loading states immediately
   - Optimize image sizes
   - Progressive loading
   - Retry failed loads

**Verification Checklist**:
- [ ] All touch targets are large enough
- [ ] Text is readable on small screens
- [ ] No horizontal overflow
- [ ] Animations perform well
- [ ] Keyboard doesn't cause layout issues
- [ ] Gestures work naturally
- [ ] Works on slow networks

**Testing Instructions**:
- Test on real iPhone and Android device
- Test with slow network (3G throttling)
- Test in portrait and landscape
- Verify all interactions work with touch
- Check accessibility (font scaling)
- Run Lighthouse mobile audit

**Commit Message Template**:
```
feat(frontend): optimize for mobile devices

- Increase touch target sizes (min 44px)
- Adjust font sizes for readability
- Fix overflow and scrolling issues
- Reduce animations on mobile
- Handle mobile keyboard properly
- Add swipe gestures for image modal
- Optimize for slow networks
```

**Estimated Tokens**: ~5,000

---

### Task 8: Final Polish and Testing

**Goal**: Final polish, bug fixes, and comprehensive testing

**Files to Modify**:
- All components as needed

**Prerequisites**: Tasks 1-7 complete

**Implementation Steps**:

1. Visual polish:
   - Review all components for visual consistency
   - Ensure spacing, colors, fonts match design
   - Fix any visual bugs or glitches
   - Smooth all animations
   - Add micro-interactions (hover effects, etc.)

2. Performance optimization:
   - Run Lighthouse audit
   - Optimize bundle size (code splitting, lazy loading)
   - Optimize images (compress, WebP format)
   - Remove unused dependencies
   - Minimize CSS and JS

3. Error handling review:
   - Test all error scenarios
   - Ensure error messages are helpful
   - Add error boundaries for graceful failure
   - Log errors for debugging

4. Accessibility audit:
   - Run axe or WAVE accessibility checker
   - Fix all violations
   - Test with screen reader
   - Ensure keyboard navigation works everywhere
   - Check color contrast

5. Cross-browser testing:
   - Test in Chrome, Firefox, Safari, Edge
   - Fix browser-specific issues
   - Use autoprefixer for CSS compatibility
   - Polyfills if needed

6. Comprehensive testing:
   - Test all features end-to-end
   - Test edge cases (empty states, errors, limits)
   - Test rapid interactions (spam clicking)
   - Test concurrent usage (multiple tabs)
   - Load testing (many galleries)

7. Documentation:
   - Update README with features and usage
   - Document known issues
   - Add troubleshooting guide
   - Screenshot gallery for documentation

**Verification Checklist**:
- [ ] Visual design is polished and consistent
- [ ] Lighthouse score > 90 (performance, accessibility)
- [ ] All errors handled gracefully
- [ ] Accessibility violations fixed
- [ ] Works in all major browsers
- [ ] All features tested and working
- [ ] Documentation is complete

**Testing Instructions**:
- Run full test suite
- Perform manual testing of all features
- Run Lighthouse and fix issues
- Test in all browsers
- Get user feedback (if possible)
- Fix all critical bugs before release

**Commit Message Template**:
```
feat(frontend): final polish and optimization

- Polish visual design and animations
- Optimize performance (bundle size, lazy loading)
- Fix all accessibility violations
- Add comprehensive error handling
- Test and fix cross-browser issues
- Update documentation with features and usage
```

**Estimated Tokens**: ~4,500

---

## Phase Verification

### Complete Phase Checklist

Before moving to Section 4, verify:

- [ ] Gallery browser displays past generations
- [ ] Can select and load galleries
- [ ] Sound effects play on interactions
- [ ] Breathing background animates smoothly
- [ ] Expandable sections work
- [ ] All advanced features implemented (modal, download, copy, shortcuts)
- [ ] Mobile optimizations complete
- [ ] Final polish and testing done

### Feature Parity Checklist

Compare with pixel-prompt-js to ensure parity:

- [ ] Prompt input with character count and clear
- [ ] Parameter sliders (steps, guidance)
- [ ] Generate button with loading states
- [ ] Prompt enhancement
- [ ] Image grid with 9 models
- [ ] Progressive loading as models complete
- [ ] Gallery browser with previews
- [ ] Sound effects on interactions
- [ ] Breathing background
- [ ] Expandable sections
- [ ] Image expansion modal
- [ ] Download images
- [ ] Copy prompt/parameters
- [ ] Keyboard shortcuts
- [ ] Responsive mobile design

### Performance Benchmarks

Run Lighthouse audit and verify:
- Performance: > 90
- Accessibility: 100
- Best Practices: > 90
- SEO: > 90

Bundle size targets:
- JavaScript: < 500KB (gzipped)
- CSS: < 50KB (gzipped)
- Total page weight: < 1MB

### Known Limitations

- Gallery may be slow with 100+ generations (add pagination)
- Sound effects may not work on first load (autoplay restrictions)
- Some animations may lag on very old devices
- Limited to 9 models (backend constraint)

---

## Section 4: Integration Testing & Documentation

### Section Goal

Conduct comprehensive end-to-end testing of the entire system, fix all critical bugs, create production-ready documentation, and prepare for deployment. This phase ensures the pixel-prompt-complete distribution is stable, well-documented, and ready for use.

**Success Criteria**:
- All integration tests pass
- No critical bugs remaining
- Comprehensive documentation complete
- Deployment guide tested and verified
- Performance benchmarks meet targets
- Security review complete
- Ready for production deployment

**Estimated Tokens**: ~15,000

---

### Prerequisites

- All previous sections complete
- Backend deployed to AWS
- Frontend built and testable
- Access to testing environments

---

### Tasks

### Task 1: End-to-End Integration Tests

**Goal**: Create and execute comprehensive integration test suite

**Files to Create**:
- `/tests/integration/test_full_workflow.py` - Backend integration tests
- `/frontend/tests/integration.test.js` - Frontend integration tests
- `/tests/e2e/test_scenarios.js` - End-to-end browser tests (optional: Playwright/Cypress)

**Prerequisites**: All phases complete

**Implementation Steps**:

1. **Backend Integration Tests** (Python):
   - Test 1: Full generation workflow
     - Create job with POST /generate
     - Poll GET /status until complete
     - Verify all 9 models succeeded
     - Verify images saved to S3
     - Verify job status is "completed"
   - Test 2: Rate limiting
     - Make GLOBAL_LIMIT + 1 requests
     - Verify 429 response
     - Test IP whitelisting
   - Test 3: Content filtering
     - Submit inappropriate prompt
     - Verify 400 response
     - Verify no job created
   - Test 4: Prompt enhancement
     - Call POST /enhance
     - Verify enhanced prompt returned
     - Verify longer than original
   - Test 5: Error handling
     - Invalid API keys (set env to bad keys)
     - Timeout scenarios
     - S3 unavailable
     - Network errors

2. **Frontend Integration Tests** (JavaScript):
   - Test 1: Component integration
     - Render full app
     - Verify all components present
     - Verify state management works
   - Test 2: API client integration
     - Mock backend responses
     - Test generateImages flow
     - Test getJobStatus polling
     - Test enhancePrompt
   - Test 3: Gallery integration
     - Mock gallery data
     - Test fetchGalleries
     - Test loadGallery
     - Verify images display

3. **End-to-End Tests** (Browser, optional but recommended):
   - Use Playwright or Cypress
   - Test 1: Full user journey
     - Open app
     - Enter prompt
     - Adjust parameters
     - Click generate
     - Wait for images
     - Verify all 9 images appear
   - Test 2: Gallery flow
     - Generate images
     - Open gallery
     - Click preview
     - Verify images load
   - Test 3: Error scenarios
     - Disconnect network
     - Verify error message
     - Reconnect
     - Verify retry works

4. Run all tests and document results:
   - Create test report
   - Note pass/fail for each test
   - Document any flaky tests
   - Fix all failing tests

**Verification Checklist**:
- [ ] All backend integration tests pass
- [ ] All frontend integration tests pass
- [ ] E2E tests pass (if implemented)
- [ ] Test coverage > 70% for critical paths
- [ ] No flaky tests (tests pass consistently)

**Testing Instructions**:
```bash
# Backend tests
cd backend
pytest tests/integration/ -v

# Frontend tests
cd frontend
npm run test:integration

# E2E tests (if using Playwright)
npx playwright test
```

**Commit Message Template**:
```
test: add comprehensive integration test suite

- Add backend integration tests (full workflow, rate limit, content filter)
- Add frontend integration tests (components, API client, gallery)
- Add E2E browser tests with Playwright (optional)
- Document test results and coverage
```

**Estimated Tokens**: ~5,000

---

### Task 2: Security Review and Hardening

**Goal**: Review and fix security vulnerabilities

**Files to Modify**:
- Backend Lambda code
- Frontend code
- SAM template

**Prerequisites**: Task 1 complete

**Implementation Steps**:

1. **Backend Security Review**:
   - Check API key handling:
     - Never log API keys
     - Keys stored in environment variables only
     - No keys in code or version control
   - Check input validation:
     - Prompt max length enforced
     - Parameters within valid ranges
     - No SQL injection risk (N/A - no SQL)
     - No command injection risk
   - Check output sanitization:
     - Error messages don't leak sensitive info
     - Stack traces not exposed to users
   - Check rate limiting:
     - Works correctly
     - Can't be bypassed
     - IP whitelist is intentional
   - Check S3 permissions:
     - Bucket not publicly writable
     - CloudFront OAI correctly configured
     - No unintended public access

2. **Frontend Security Review**:
   - Check for XSS vulnerabilities:
     - User input properly escaped
     - No dangerouslySetInnerHTML with user content
     - React handles escaping by default
   - Check API endpoint configuration:
     - Endpoint URL from environment variable
     - Not hardcoded in code
   - Check secrets exposure:
     - No API keys in frontend code
     - No sensitive data in localStorage
   - Check dependencies:
     - Run `npm audit` and fix vulnerabilities
     - Update dependencies to latest secure versions

3. **Infrastructure Security**:
   - Review SAM template:
     - Least privilege IAM roles
     - No overly permissive policies
     - S3 bucket not publicly accessible
     - CloudFront HTTPS enforced
     - API Gateway CORS not too permissive (restrict origins in production)
   - Review network security:
     - All traffic over HTTPS
     - No HTTP allowed

4. **Security Scanning**:
   - Run SAST tools:
     - `bandit` for Python (backend)
     - `npm audit` for JavaScript (frontend)
   - Fix all HIGH and CRITICAL vulnerabilities
   - Document MEDIUM and LOW for later

5. **Document security considerations**:
   - Create SECURITY.md:
     - Responsible disclosure policy
     - Known security considerations
     - How to report vulnerabilities
     - Security best practices for deployment

**Verification Checklist**:
- [ ] No API keys in code or logs
- [ ] Input validation on all user inputs
- [ ] Rate limiting prevents abuse
- [ ] S3 bucket permissions correct
- [ ] No XSS vulnerabilities
- [ ] Dependencies up to date and secure
- [ ] IAM roles follow least privilege
- [ ] All traffic over HTTPS
- [ ] Security scanners pass
- [ ] SECURITY.md documented

**Testing Instructions**:
- Run security scanners:
  ```bash
  # Backend
  pip install bandit
  bandit -r backend/src/

  # Frontend
  npm audit
  ```
- Manual security review
- Test rate limiting edge cases
- Verify S3 bucket is not publicly accessible

**Commit Message Template**:
```
security: comprehensive security review and hardening

- Fix API key handling and logging
- Add input validation for all parameters
- Review and fix IAM permissions (least privilege)
- Fix dependency vulnerabilities
- Add SECURITY.md with disclosure policy
- Verify HTTPS everywhere
```

**Estimated Tokens**: ~4,000

---

### Task 3: Performance Testing and Optimization

**Goal**: Measure and optimize system performance

**Files to Modify**:
- Various backend and frontend files as needed

**Prerequisites**: Task 2 complete

**Implementation Steps**:

1. **Backend Performance Testing**:
   - Test Lambda cold start time:
     - Measure time for first invocation
     - Target: < 3 seconds
   - Test Lambda warm execution time:
     - Measure time for subsequent invocations
     - Target: < 500ms for job creation
   - Test parallel model execution:
     - Measure time for all 9 models
     - Target: 30-90 seconds (depends on external APIs)
     - Verify models run in parallel, not sequential
   - Test S3 operations:
     - Measure put_object latency
     - Measure get_object latency
     - Target: < 200ms
   - Load test:
     - Simulate 100 concurrent users
     - Verify no errors or timeouts
     - Check CloudWatch logs for issues

2. **Frontend Performance Testing**:
   - Run Lighthouse audit:
     - Performance score target: > 90
     - Identify and fix performance issues
   - Measure bundle size:
     - JavaScript target: < 500KB gzipped
     - CSS target: < 50KB gzipped
     - If too large, code split and lazy load
   - Measure page load time:
     - First Contentful Paint: < 1.5s
     - Time to Interactive: < 3.5s
     - Largest Contentful Paint: < 2.5s
   - Test image loading:
     - Measure time to display first image
     - Verify progressive loading works
     - Optimize blob URL creation

3. **Optimize as needed**:
   - Backend optimizations:
     - Reduce Lambda package size (remove unused deps)
     - Use Lambda Layers for large dependencies
     - Optimize S3 key structure for faster lookups
     - Add caching (if beneficial)
   - Frontend optimizations:
     - Code splitting (dynamic imports)
     - Lazy load components not needed initially
     - Optimize images (compress, WebP)
     - Tree shake unused code
     - Use React.memo for expensive components
     - Debounce expensive operations

4. **Document performance benchmarks**:
   - Create PERFORMANCE.md:
     - Measured performance metrics
     - Benchmarking methodology
     - Optimization techniques used
     - Known performance limitations

**Verification Checklist**:
- [ ] Lambda cold start < 3s
- [ ] Lambda warm execution < 500ms
- [ ] Parallel execution works (models run concurrently)
- [ ] Lighthouse performance score > 90
- [ ] Bundle size within targets
- [ ] Page load times meet targets
- [ ] Load testing passes (100 concurrent users)

**Testing Instructions**:
```bash
# Backend load test (using Artillery or k6)
artillery quick --count 100 --num 10 $API_ENDPOINT/generate

# Frontend performance
cd frontend
npm run build
npm run preview
# Run Lighthouse audit in Chrome DevTools

# Measure bundle size
du -sh dist/*
```

**Commit Message Template**:
```
perf: performance testing and optimization

- Measure Lambda cold start and warm execution times
- Run load test with 100 concurrent users
- Optimize frontend bundle size with code splitting
- Run Lighthouse audit and fix performance issues
- Document performance benchmarks in PERFORMANCE.md
```

**Estimated Tokens**: ~4,000

---

### Task 4: Comprehensive Documentation

**Goal**: Create complete, user-friendly documentation

**Files to Create**:
- `/README.md` - Main repository README
- `/backend/README.md` - Backend-specific docs
- `/frontend/README.md` - Frontend-specific docs
- `/DEPLOYMENT.md` - Deployment guide
- `/USAGE.md` - User guide
- `/CONTRIBUTING.md` - Contribution guidelines (if open source)
- `/ARCHITECTURE.md` - Architecture documentation

**Prerequisites**: Task 3 complete

**Implementation Steps**:

1. **Main README.md**:
   - Project overview and description
   - Features list
   - Architecture diagram
   - Quick start guide
   - Prerequisites
   - Links to detailed documentation
   - Screenshots/demo GIF
   - License information
   - Acknowledgments

2. **DEPLOYMENT.md**:
   - Detailed deployment instructions
   - Prerequisites (AWS account, CLI tools)
   - Step-by-step backend deployment:
     - Configuring SAM parameters
     - Running sam build and deploy
     - Verifying deployment
   - Step-by-step frontend deployment:
     - Building the app
     - Deploying to hosting (S3, Netlify, Vercel, etc.)
     - Configuring environment variables
   - Post-deployment verification
   - Troubleshooting common issues
   - Cost estimation
   - Cleanup instructions (delete stack)

3. **USAGE.md**:
   - User guide for end users
   - How to generate images:
     - Enter prompt
     - Adjust parameters
     - Generate and wait
   - How to use gallery
   - How to enhance prompts
   - Keyboard shortcuts
   - Tips for best results
   - FAQs

4. **ARCHITECTURE.md**:
   - System architecture overview
   - Component descriptions:
     - Frontend (Vite React)
     - Backend (Lambda)
     - Storage (S3)
     - CDN (CloudFront)
     - API (API Gateway)
   - Data flow diagrams
   - Model registry and routing logic
   - Job management and polling
   - Design decisions (reference Phase-0)
   - Technology stack

5. **Backend and Frontend READMEs**:
   - Development setup
   - Running locally
   - Testing
   - Building
   - Deploying
   - Code structure
   - Key files and their purposes

6. **CONTRIBUTING.md** (if open source):
   - How to contribute
   - Code style guidelines
   - Pull request process
   - Issue reporting
   - Development workflow

**Verification Checklist**:
- [ ] README.md is comprehensive and clear
- [ ] DEPLOYMENT.md has step-by-step instructions
- [ ] USAGE.md helps end users
- [ ] ARCHITECTURE.md explains system design
- [ ] All docs are well-formatted (proper markdown)
- [ ] Links work (no broken links)
- [ ] Screenshots/diagrams included
- [ ] No sensitive information in docs

**Testing Instructions**:
- Have someone unfamiliar with project read docs
- Verify they can understand and follow instructions
- Test deployment guide on fresh AWS account
- Check all links
- Spell check all documents

**Commit Message Template**:
```
docs: create comprehensive project documentation

- Add main README with overview and quick start
- Create DEPLOYMENT.md with step-by-step guide
- Add USAGE.md user guide
- Document architecture in ARCHITECTURE.md
- Add backend and frontend specific docs
- Include troubleshooting and FAQs
```

**Estimated Tokens**: ~5,000

---

### Task 5: Final Testing and Bug Fixes

**Goal**: Final round of testing and fix all remaining bugs

**Files to Modify**:
- Any files with bugs

**Prerequisites**: Tasks 1-4 complete

**Implementation Steps**:

1. **Create comprehensive test checklist**:
   - List every feature
   - List every user flow
   - List every edge case
   - Assign testing priority (P0, P1, P2)

2. **Execute test plan**:
   - Test each item on checklist
   - Note any bugs or issues
   - Categorize bugs by severity:
     - **Critical**: Blocks usage, data loss, security
     - **Major**: Feature doesn't work, poor UX
     - **Minor**: Cosmetic, rare edge case

3. **Fix all critical and major bugs**:
   - Create GitHub issues (or bug tracking system)
   - Prioritize critical bugs
   - Fix all critical before proceeding
   - Fix major bugs if time allows
   - Document known minor bugs for later

4. **Regression testing**:
   - After fixing bugs, test full system again
   - Verify fixes don't break other features
   - Run integration tests again

5. **User acceptance testing** (if possible):
   - Get real users to test the system
   - Observe their usage
   - Collect feedback
   - Fix usability issues

6. **Create bug tracker**:
   - GitHub Issues (if using GitHub)
   - Document known bugs
   - Label by severity
   - Assign to future milestones

**Verification Checklist**:
- [ ] All critical bugs fixed
- [ ] All major bugs fixed or documented
- [ ] Regression testing passed
- [ ] User feedback incorporated (if applicable)
- [ ] Known bugs documented in issue tracker

**Testing Instructions**:
- Execute full test plan systematically
- Test on multiple browsers and devices
- Test with different network conditions
- Test edge cases and error scenarios
- Collect and analyze user feedback

**Commit Message Template**:
```
fix: comprehensive bug fixing from final testing

- Fix critical bugs (list bugs)
- Fix major bugs (list bugs)
- Document known minor bugs in issue tracker
- Pass regression testing
- Incorporate user feedback
```

**Estimated Tokens**: ~3,000

---

### Task 6: Deployment Verification

**Goal**: Verify deployment process and production readiness

**Files to Create**:
- `/.env.production.example` - Production environment variables template
- `/PRODUCTION_CHECKLIST.md` - Pre-deployment checklist

**Prerequisites**: Task 5 complete

**Implementation Steps**:

1. **Create production environment config**:
   - Backend: Production SAM parameters
   - Frontend: Production .env file
   - Verify all secrets are configured
   - Verify API endpoints are correct

2. **Deploy to production environment**:
   - Follow DEPLOYMENT.md instructions
   - Deploy backend to production AWS account
   - Build and deploy frontend to production hosting
   - Configure custom domain (if applicable)
   - Set up SSL/TLS certificates
   - Configure DNS

3. **Production smoke testing**:
   - Test each API endpoint in production
   - Generate test images
   - Verify images saved to S3
   - Verify CloudFront serving images
   - Test frontend end-to-end
   - Verify gallery works
   - Test all features in production

4. **Monitoring and logging setup**:
   - Verify CloudWatch logs are working
   - Set up CloudWatch alarms:
     - Lambda errors
     - High Lambda duration
     - API Gateway 5xx errors
     - High S3 costs
   - Set up logging for frontend (Sentry, LogRocket, etc.)
   - Configure SNS notifications for alerts

5. **Create production checklist**:
   - Pre-deployment checks:
     - All tests pass
     - Documentation updated
     - Secrets configured
     - Monitoring set up
   - Deployment steps
   - Post-deployment verification
   - Rollback plan

6. **Create runbook**:
   - Common operations:
     - Deploying updates
     - Checking logs
     - Troubleshooting errors
     - Scaling (if needed)
   - Emergency procedures:
     - Rollback deployment
     - Handle outages
     - Contact information

**Verification Checklist**:
- [ ] Production environment configured
- [ ] Backend deployed to production
- [ ] Frontend deployed to production
- [ ] Custom domain configured (if applicable)
- [ ] SSL/TLS working
- [ ] Production smoke tests pass
- [ ] Monitoring and alarms set up
- [ ] Production checklist created
- [ ] Runbook documented

**Testing Instructions**:
- Deploy to production
- Run full smoke test
- Verify monitoring (trigger test alarm)
- Verify logging (check CloudWatch logs)
- Test rollback procedure
- Verify custom domain and SSL

**Commit Message Template**:
```
chore: production deployment and verification

- Configure production environment
- Deploy backend and frontend to production
- Set up CloudWatch monitoring and alarms
- Create production deployment checklist
- Document runbook for operations
- Verify production deployment with smoke tests
```

**Estimated Tokens**: ~3,000

---

## Phase Verification

### Complete Phase Checklist

Before considering the project complete, verify:

- [ ] All integration tests pass
- [ ] Security review complete, vulnerabilities fixed
- [ ] Performance benchmarks met
- [ ] Comprehensive documentation complete
- [ ] All critical and major bugs fixed
- [ ] Production deployment successful
- [ ] Monitoring and alerting configured
- [ ] Runbook and operational docs complete

### Final Acceptance Criteria

**Functionality**:
- [ ] User can generate images from multiple models
- [ ] Gallery displays and loads past generations
- [ ] Prompt enhancement works
- [ ] Rate limiting prevents abuse
- [ ] Content filtering blocks inappropriate prompts
- [ ] All UI features work (sounds, animations, etc.)

**Quality**:
- [ ] No critical bugs
- [ ] Performance meets benchmarks
- [ ] Security vulnerabilities addressed
- [ ] Accessible (WCAG AA compliance)
- [ ] Works on all major browsers
- [ ] Responsive on mobile and desktop

**Documentation**:
- [ ] README is clear and comprehensive
- [ ] Deployment guide is accurate and complete
- [ ] User guide helps end users
- [ ] Architecture is documented
- [ ] Code is commented where necessary

**Operations**:
- [ ] Deployed to production successfully
- [ ] Monitoring and logging working
- [ ] Alarms configured
- [ ] Runbook available for operations
- [ ] Rollback plan tested

---

## Project Completion

Once all tasks in Section 4 are complete and all verification criteria met:

**Celebrate!** You've successfully built pixel-prompt-complete, a fully serverless text-to-image generation platform with:
- Dynamic model registry supporting multiple AI providers
- Async job processing with real-time updates
- Modern React frontend with full feature parity
- Comprehensive gallery system
- Professional deployment infrastructure
- Production-ready documentation

### Next Steps (Post-Launch)

**Maintenance**:
- Monitor usage and errors
- Address user feedback
- Fix bugs as reported
- Keep dependencies updated

**Enhancements** (Future):
- Add more AI models (Hunyuan, Qwen, etc.)
- Implement user authentication (Cognito)
- Add image-to-image generation
- Create model comparison view
- Add batch generation
- Implement job history/management
- Add usage analytics

**Community** (if open source):
- Accept pull requests
- Review issues
- Update documentation
- Build community

---

## Congratulations!

The pixel-prompt-complete distribution is now complete, tested, documented, and deployed. This represents a production-ready, scalable, and maintainable system that combines the best of the pixel-prompt ecosystem into a unified serverless application.
