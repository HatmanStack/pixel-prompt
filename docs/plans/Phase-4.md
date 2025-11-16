# Phase 4: Performance Optimizations & Advanced UI Features

## Phase Goal

Implement frontend performance optimizations (code splitting, lazy loading, React.memo, tree shaking) and complete all 6 remaining advanced UI features (image expansion modal, random prompt button, parameter presets, copy-to-clipboard, download images, keyboard shortcuts) to create a polished, production-grade user experience.

**Success Criteria:**
- Bundle size reduced by 30%+ through code splitting and tree shaking
- Lazy loading implemented for gallery and admin sections
- React.memo applied to expensive components (ImageCard)
- All 6 advanced UI features implemented and tested
- Keyboard shortcuts functional (Ctrl+Enter, Ctrl+E, etc.)
- Frontend performance improved measurably (Lighthouse > 92)
- All new features have corresponding tests

**Estimated Tokens:** ~120,000

---

## Prerequisites

- Phase 0 reviewed (optimization patterns documented)
- Phase 1 complete (testing infrastructure in place)
- Phase 3 complete (performance baseline established)
- Frontend running locally for development

---

## Tasks

### Task 1: Frontend Code Splitting and Lazy Loading

**Goal:** Implement code splitting using React.lazy() and dynamic imports to reduce initial bundle size, lazy-load non-critical sections (Gallery, future Admin), and measure bundle size reduction.

**Files to Modify/Create:**
- `frontend/src/App.jsx` - Add lazy loading for sections
- `frontend/src/components/common/LoadingSpinner.jsx` - Loading component for suspense
- `frontend/vite.config.js` - Configure chunk splitting
- `frontend/package.json` - Add bundle size analysis script

**Prerequisites:**
- None (first task in phase)

**Implementation Steps:**

1. **Analyze Current Bundle**
   - Install rollup-plugin-visualizer: `npm install -D rollup-plugin-visualizer`
   - Add to vite.config.js to generate bundle analysis
   - Run `npm run build` and review bundle composition
   - Identify large chunks and dependencies (react, api client, components)
   - Document current bundle size for comparison

2. **Create Loading Spinner Component**
   - Create simple loading spinner or skeleton component
   - Used as fallback for React.Suspense
   - Match app's visual design
   - Support optional message prop ("Loading gallery...")

3. **Implement Lazy Loading for Gallery**
   - Wrap GalleryBrowser import with React.lazy()
   - Wrap in React.Suspense with LoadingSpinner fallback
   - Gallery code now in separate chunk, loaded only when user navigates to gallery
   - Test that gallery loads correctly when accessed

4. **Configure Vite Chunk Splitting**
   - Update vite.config.js `build.rollupOptions.output.manualChunks`
   - Create separate chunks:
     - `vendor`: React, React-DOM
     - `api`: API client and utilities
     - `components`: All components
   - Configure chunk naming for clarity

5. **Implement Tree Shaking**
   - Review imports: use named imports instead of default where possible
   - Example: `import { useState } from 'react'` instead of `import React`
   - Remove unused imports and dependencies
   - Verify with bundle analyzer that unused code removed

6. **Optimize Dependencies**
   - Check for duplicate dependencies in bundle
   - Consider lighter alternatives if large packages found
   - Example: if using moment.js, replace with date-fns (smaller)
   - Review if all dependencies actually needed

7. **Measure Bundle Size Reduction**
   - Run `npm run build` after optimizations
   - Compare to baseline from step 1
   - Document reduction in PERFORMANCE.md
   - Target: 30%+ reduction in initial bundle size
   - Verify lazy-loaded chunks created (gallery.js, etc.)

8. **Add Bundle Size Script**
   - Add `npm run analyze` script to package.json
   - Opens bundle visualization in browser
   - Useful for ongoing optimization and PR reviews

**Verification Checklist:**
- [ ] Bundle analyzer shows separate chunks (vendor, api, components, gallery)
- [ ] Gallery lazy-loads (network tab shows gallery.js loaded on navigation)
- [ ] Initial bundle size reduced by 30%+
- [ ] No duplicate dependencies in bundle
- [ ] Tree shaking removes unused code
- [ ] Loading spinner displays during lazy load
- [ ] All features still work correctly

**Testing Instructions:**
```bash
# Build and analyze
npm run build
npm run analyze

# Check bundle sizes
ls -lh dist/assets/
# Should see: main.js (smaller), vendor.js, gallery.js, etc.

# Test lazy loading
npm run dev
# Navigate to Gallery, check Network tab
# Should load gallery chunk only when accessed

# Compare bundle sizes (before/after)
# Document in PERFORMANCE.md
```

**Commit Message Template:**
```
perf(frontend): implement code splitting and lazy loading

- Add React.lazy() for GalleryBrowser (separate chunk)
- Configure Vite manual chunk splitting (vendor, api, components)
- Implement tree shaking with named imports
- Create LoadingSpinner for Suspense fallback
- Add bundle analyzer for ongoing optimization
- Reduce initial bundle size by 35% (420KB → 273KB gzipped)
```

**Estimated Tokens:** ~18,000

---

### Task 2: React.memo for Performance Optimization

**Goal:** Apply React.memo to expensive components (ImageCard, GalleryPreview) to prevent unnecessary re-renders and improve runtime performance.

**Files to Modify/Create:**
- `frontend/src/components/features/generation/ImageCard.jsx` - Memoize
- `frontend/src/components/features/gallery/GalleryPreview.jsx` - Memoize
- `frontend/src/hooks/useMemoizedCallback.js` - Custom hook for callbacks
- `frontend/src/__tests__/components/ImageCard.test.jsx` - Update tests

**Prerequisites:**
- Task 1 complete (baseline performance established)

**Implementation Steps:**

1. **Identify Re-render Issues**
   - Use React DevTools Profiler to identify excessive re-renders
   - Look for components rendering when props haven't changed
   - Common culprits: ImageCard (renders 9 times in grid), GalleryPreview
   - Document current render count during typical user flow

2. **Memoize ImageCard Component**
   - Wrap export with React.memo: `export default React.memo(ImageCard)`
   - Define custom comparison function if needed (compare specific props)
   - ImageCard should only re-render when its specific image updates
   - Test that re-renders reduced (use React DevTools Profiler)

3. **Memoize GalleryPreview Component**
   - Wrap with React.memo
   - Prevents re-render when other gallery items update
   - Only re-renders when preview data changes

4. **Handle Callback Props**
   - If callbacks passed to memoized components, wrap with useCallback
   - Example: `onClick` handler in parent wrapped with useCallback
   - Prevents breaking memoization due to new callback on every render

5. **Create useMemoizedCallback Hook**
   - Custom hook that wraps useCallback with common dependencies
   - Simplifies callback memoization across components
   - Document usage pattern in code comments

6. **Avoid Over-Memoization**
   - Don't memoize every component (overhead not worth it for simple components)
   - Focus on components that:
     - Render frequently (in lists, grids)
     - Have expensive render logic
     - Receive complex props that rarely change

7. **Measure Performance Improvement**
   - Use React DevTools Profiler to compare before/after
   - Measure render time for generating images (9 ImageCards)
   - Document improvement in PERFORMANCE.md
   - Expected: 30-50% reduction in unnecessary re-renders

8. **Update Tests**
   - Ensure component tests still pass with memoization
   - Test that components re-render when props change
   - Test that components don't re-render when props same

**Verification Checklist:**
- [ ] ImageCard wrapped with React.memo
- [ ] GalleryPreview wrapped with React.memo
- [ ] Callback props memoized with useCallback
- [ ] React DevTools Profiler shows reduced re-renders
- [ ] No visual regressions (UI works identically)
- [ ] Component tests pass
- [ ] Performance improvement documented

**Testing Instructions:**
```bash
# Run tests
npm test ImageCard
npm test GalleryPreview

# Manual testing with React DevTools
# 1. Open app with React DevTools Profiler
# 2. Start profiling
# 3. Generate images
# 4. Stop profiling
# 5. Review render count for ImageCard (should be minimal)

# Compare to baseline (before memoization)
# Document in PERFORMANCE.md
```

**Commit Message Template:**
```
perf(frontend): add React.memo to expensive components

- Wrap ImageCard with React.memo to prevent re-renders
- Wrap GalleryPreview with React.memo
- Create useMemoizedCallback hook for callback optimization
- Memoize onClick callbacks with useCallback
- Reduce unnecessary re-renders by 40% (measured with Profiler)
- Update component tests to verify memoization
```

**Estimated Tokens:** ~15,000

---

### Task 3: Advanced UI - Image Expansion Modal

**Goal:** Implement modal dialog that displays full-size image when user clicks on ImageCard, with keyboard navigation (arrow keys, Escape to close) and download/share options.

**Files to Modify/Create:**
- `frontend/src/components/features/generation/ImageModal.jsx` - Modal component
- `frontend/src/components/common/Modal.jsx` - Reusable modal wrapper
- `frontend/src/components/features/generation/ImageGrid.jsx` - Add modal trigger
- `frontend/src/styles/Modal.module.css` - Modal styling
- `frontend/src/__tests__/components/ImageModal.test.jsx` - Tests

**Prerequisites:**
- None (independent feature)

**Implementation Steps:**

1. **Create Reusable Modal Component**
   - Create Modal.jsx with overlay and content area
   - Support `isOpen`, `onClose`, `children` props
   - Click overlay to close, Escape key to close
   - Prevent body scroll when modal open
   - Accessible: focus trap, aria-modal, role="dialog"

2. **Create ImageModal Component**
   - Display full-size image in modal
   - Show model name, generation time, prompt
   - Include download button
   - Include share button (if implemented)
   - Include close button (X in top-right)

3. **Implement Keyboard Navigation**
   - Left arrow: previous image (in grid)
   - Right arrow: next image (in grid)
   - Escape: close modal
   - Track current image index in state
   - Wrap around: last image → first image

4. **Add Modal Trigger to ImageCard**
   - Update ImageCard to accept onClick prop
   - Pass to image element
   - ImageGrid manages modal state (isOpen, currentImage)
   - Click on any image opens modal with that image

5. **Style Modal**
   - Dark overlay (rgba(0,0,0,0.8))
   - Centered content area
   - Responsive: full-screen on mobile, constrained on desktop
   - Smooth open/close transition (fade in/out)
   - Image scales to fit viewport (max-width: 90vw, max-height: 90vh)

6. **Handle Edge Cases**
   - Loading state: show spinner while image loads in modal
   - Error state: show error if image fails to load
   - Touch gestures: swipe left/right on mobile for navigation
   - Handle window resize (modal repositions)

7. **Write Tests**
   - Test modal opens when image clicked
   - Test modal closes on Escape, overlay click, close button
   - Test keyboard navigation (arrow keys)
   - Test accessibility (focus trap, ARIA attributes)
   - Test edge cases (first/last image, loading/error)

**Verification Checklist:**
- [ ] Click image opens modal with full-size image
- [ ] Escape key closes modal
- [ ] Arrow keys navigate between images
- [ ] Download button works in modal
- [ ] Modal is accessible (screen reader friendly)
- [ ] Mobile responsive (full-screen modal)
- [ ] Tests pass for modal functionality

**Testing Instructions:**
```bash
npm test ImageModal
npm test Modal

# Manual testing
# 1. Generate images
# 2. Click on any image
# 3. Verify modal opens with full image
# 4. Press left/right arrows to navigate
# 5. Press Escape to close
# 6. Click overlay to close
# 7. Test on mobile (swipe gestures)
```

**Commit Message Template:**
```
feat(frontend): add image expansion modal with keyboard nav

- Create reusable Modal component with overlay
- Create ImageModal for full-size image display
- Implement keyboard navigation (arrows, Escape)
- Add click handler to ImageCard to trigger modal
- Support swipe gestures on mobile
- Add accessibility features (focus trap, ARIA)
- Add tests for modal functionality and navigation
```

**Estimated Tokens:** ~20,000

---

### Task 4: Advanced UI - Random Prompt Button

**Goal:** Add "Random Prompt" button that populates prompt input with creative seed prompts, helping users get started and explore different image styles.

**Files to Modify/Create:**
- `frontend/src/components/features/generation/RandomPromptButton.jsx` - Button component
- `frontend/src/data/seedPrompts.js` - Curated prompt list
- `frontend/src/components/features/generation/PromptInput.jsx` - Integrate button
- `frontend/src/__tests__/components/RandomPromptButton.test.jsx` - Tests

**Prerequisites:**
- None (independent feature)

**Implementation Steps:**

1. **Create Seed Prompts Collection**
   - Create `seedPrompts.js` with array of 50+ creative prompts
   - Include variety of styles: photorealistic, artistic, abstract, fantasy
   - Examples:
     - "A serene mountain lake at sunset with reflections"
     - "Cyberpunk city street with neon signs in the rain"
     - "Watercolor painting of a flower garden in spring"
   - Categorize by style (optional): landscapes, portraits, abstract, etc.

2. **Create RandomPromptButton Component**
   - Button labeled "Random Prompt" or "Inspire Me" with icon (🎲)
   - onClick: select random prompt from seedPrompts
   - Call parent callback with selected prompt
   - Animate button on click (slight bounce or rotation)

3. **Integrate with PromptInput**
   - Add RandomPromptButton next to or above PromptInput
   - When clicked, populate PromptInput with random prompt
   - Clear existing prompt (or append if user prefers)
   - Focus PromptInput after populating

4. **Prevent Consecutive Duplicates**
   - Track last selected prompt in state
   - Ensure random selection differs from last selection
   - Prevents user getting same prompt twice in a row

5. **Add Keyboard Shortcut**
   - Ctrl+R (or Cmd+R): trigger random prompt
   - Document in keyboard shortcuts help (Task 8)
   - Show tooltip with shortcut on button hover

6. **Style Button**
   - Match app's visual design
   - Use icon (dice emoji or SVG icon)
   - Hover effect (highlight or scale)
   - Disabled state if generation in progress

7. **Write Tests**
   - Test button click populates prompt
   - Test random selection (different prompts on multiple clicks)
   - Test no consecutive duplicates
   - Test keyboard shortcut (Ctrl+R)
   - Test disabled state

**Verification Checklist:**
- [ ] Random Prompt button renders in UI
- [ ] Click populates PromptInput with seed prompt
- [ ] Prompts vary on multiple clicks (no consecutive duplicates)
- [ ] Keyboard shortcut (Ctrl+R) works
- [ ] Button disabled during generation
- [ ] Tests pass for random prompt functionality

**Testing Instructions:**
```bash
npm test RandomPromptButton

# Manual testing
# 1. Click "Random Prompt" button multiple times
# 2. Verify different prompts appear
# 3. Press Ctrl+R, verify prompt changes
# 4. Start generation, verify button disabled
# 5. Test with empty and populated PromptInput
```

**Commit Message Template:**
```
feat(frontend): add Random Prompt button with seed prompts

- Create seedPrompts.js with 50+ creative prompt examples
- Create RandomPromptButton component with dice icon
- Integrate with PromptInput to populate field
- Prevent consecutive duplicate prompts
- Add Ctrl+R keyboard shortcut
- Add tests for random prompt selection
```

**Estimated Tokens:** ~15,000

---

### Task 5: Advanced UI - Parameter Presets

**Goal:** Add parameter preset buttons (Fast, Quality, Creative) that automatically configure steps, guidance, and control for common use cases.

**Files to Modify/Create:**
- `frontend/src/components/features/generation/ParameterPresets.jsx` - Preset buttons
- `frontend/src/data/presets.js` - Preset configurations
- `frontend/src/components/features/generation/GenerationPanel.jsx` - Integrate presets
- `frontend/src/__tests__/components/ParameterPresets.test.jsx` - Tests

**Prerequisites:**
- None (independent feature)

**Implementation Steps:**

1. **Define Preset Configurations**
   - Create `presets.js` with preset objects:
     ```javascript
     {
       name: "Fast",
       description: "Quick generation (lower quality)",
       steps: 15,
       guidance: 5,
       control: 1.0
     }
     ```
   - Presets:
     - **Fast**: steps 15, guidance 5, control 1.0 (quick but lower quality)
     - **Quality**: steps 50, guidance 10, control 1.5 (high quality, slower)
     - **Creative**: steps 25, guidance 3, control 0.5 (more artistic freedom)

2. **Create ParameterPresets Component**
   - Render 3 preset buttons horizontally
   - Each button shows preset name
   - Highlight active preset (if current params match)
   - onClick: call callback with preset parameters

3. **Integrate with GenerationPanel**
   - Add ParameterPresets above or below ParameterSliders
   - When preset clicked, update slider values
   - Visual feedback: sliders animate to new values
   - Allow manual adjustment after preset selected

4. **Highlight Active Preset**
   - Compare current parameter values to presets
   - Highlight matching preset button (bold border or background)
   - Show "Custom" if values don't match any preset
   - Update highlight when sliders manually adjusted

5. **Add Tooltips**
   - Hover over preset button shows tooltip with description
   - Example: "Quality: 50 steps, slower but higher quality"
   - Helps users understand trade-offs

6. **Make Presets Responsive**
   - Stack vertically on mobile (narrow screens)
   - Horizontal on tablet and desktop
   - Ensure touch-friendly button size on mobile

7. **Write Tests**
   - Test clicking preset updates parameters
   - Test active preset highlighted correctly
   - Test custom state when manually adjusted
   - Test tooltips display on hover
   - Test responsive layout (snapshot tests)

**Verification Checklist:**
- [ ] 3 preset buttons render (Fast, Quality, Creative)
- [ ] Clicking preset updates all three parameters
- [ ] Active preset highlighted based on current values
- [ ] Tooltips show preset descriptions
- [ ] Responsive layout works on mobile/desktop
- [ ] Tests pass for preset functionality

**Testing Instructions:**
```bash
npm test ParameterPresets

# Manual testing
# 1. Click "Fast" preset
# 2. Verify sliders: steps=15, guidance=5, control=1.0
# 3. Click "Quality" preset
# 4. Verify sliders update to: steps=50, guidance=10, control=1.5
# 5. Manually adjust slider
# 6. Verify no preset highlighted (or "Custom" shown)
# 7. Test on mobile (responsive layout)
```

**Commit Message Template:**
```
feat(frontend): add parameter presets (Fast, Quality, Creative)

- Create presets.js with 3 preset configurations
- Create ParameterPresets component with buttons
- Integrate with GenerationPanel to update sliders
- Highlight active preset based on current values
- Add tooltips explaining each preset
- Responsive layout for mobile/desktop
- Add tests for preset selection and highlighting
```

**Estimated Tokens:** ~18,000

---

### Task 6: Advanced UI - Copy to Clipboard with Toast Notifications

**Goal:** Add copy-to-clipboard functionality for prompts, image URLs, and generation parameters, with toast notifications confirming successful copy.

**Files to Modify/Create:**
- `frontend/src/components/common/Toast.jsx` - Toast notification component
- `frontend/src/hooks/useToast.js` - Toast management hook
- `frontend/src/hooks/useCopyToClipboard.js` - Clipboard hook
- `frontend/src/components/features/generation/CopyButton.jsx` - Reusable copy button
- `frontend/src/context/ToastContext.jsx` - Global toast provider
- `frontend/src/__tests__/hooks/useCopyToClipboard.test.js` - Tests

**Prerequisites:**
- None (independent feature)

**Implementation Steps:**

1. **Create Toast Notification Component**
   - Toast component displays temporary messages (3 seconds)
   - Position: top-right or bottom-right of screen
   - Support types: success, error, info
   - Auto-dismiss after timeout
   - Support dismissing on click
   - Stack multiple toasts if needed

2. **Create Toast Context**
   - Global state for toasts (array of toast objects)
   - Provider wraps entire app
   - Expose `showToast(message, type)` function
   - Automatically remove toasts after timeout

3. **Create useCopyToClipboard Hook**
   - Wraps `navigator.clipboard.writeText()` API
   - Returns `copyToClipboard(text)` function
   - Handle browser compatibility (fallback for older browsers)
   - Return success/error state
   - Show toast on success: "Copied to clipboard!"

4. **Create Reusable CopyButton Component**
   - Button with copy icon (📋 or SVG)
   - Accept `text` prop (what to copy)
   - Accept `label` prop (optional button text)
   - onClick: copy text to clipboard, show toast
   - Disabled state while copying

5. **Add Copy Functionality to UI**
   - ImageCard: copy button for image URL
   - PromptInput: copy button for current prompt
   - ImageModal: copy buttons for prompt, parameters, URL
   - GalleryDetail: copy button for prompt

6. **Handle Copy Errors**
   - If clipboard API fails (permissions, browser compatibility)
   - Show error toast: "Failed to copy"
   - Fallback: select text and prompt user to copy manually

7. **Style Toast Notifications**
   - Slide-in animation (from right or top)
   - Success: green background, checkmark icon
   - Error: red background, X icon
   - Info: blue background, i icon
   - Smooth fade-out on dismiss

8. **Write Tests**
   - Test useCopyToClipboard hook copies text
   - Test toast appears on successful copy
   - Test error handling (clipboard API unavailable)
   - Test CopyButton component
   - Mock navigator.clipboard for testing

**Verification Checklist:**
- [ ] CopyButton component renders in ImageCard
- [ ] Click copy button copies text to clipboard
- [ ] Toast notification appears: "Copied to clipboard!"
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Error toast appears if copy fails
- [ ] Tests pass for clipboard and toast functionality

**Testing Instructions:**
```bash
npm test useCopyToClipboard
npm test CopyButton
npm test Toast

# Manual testing
# 1. Generate images
# 2. Click copy button on ImageCard
# 3. Verify toast appears: "Copied to clipboard!"
# 4. Paste in text editor, verify URL copied
# 5. Test copy prompt button
# 6. Test multiple rapid copies (toasts stack)
```

**Commit Message Template:**
```
feat(frontend): add copy-to-clipboard with toast notifications

- Create Toast component with auto-dismiss and animations
- Create ToastContext for global toast management
- Create useCopyToClipboard hook with clipboard API
- Create reusable CopyButton component
- Add copy buttons to ImageCard, PromptInput, ImageModal
- Handle errors with fallback and error toasts
- Add tests for clipboard and toast functionality
```

**Estimated Tokens:** ~20,000

---

### Task 7: Advanced UI - Download Images Feature

**Goal:** Enhance download functionality with batch download (download all images from generation), custom filename support, and download progress indication.

**Files to Modify/Create:**
- `frontend/src/components/features/generation/DownloadButton.jsx` - Enhanced download button
- `frontend/src/components/features/generation/BatchDownload.jsx` - Download all button
- `frontend/src/utils/download.js` - Download utility functions
- `frontend/src/__tests__/utils/download.test.js` - Tests

**Prerequisites:**
- None (enhances existing download functionality)

**Implementation Steps:**

1. **Create Download Utility**
   - Function to download single image: `downloadImage(url, filename)`
   - Use fetch to get image blob
   - Create temporary `<a>` element with download attribute
   - Trigger click programmatically
   - Clean up temporary element

2. **Enhance DownloadButton**
   - If exists, enhance with custom filename
   - Filename format: `{model-name}_{timestamp}.png`
   - Example: `dalle3_2025-11-16_143045.png`
   - Show loading state during download
   - Show error toast if download fails

3. **Create Batch Download Component**
   - "Download All" button in GenerationPanel or ImageGrid
   - Downloads all completed images from current generation
   - Shows progress: "Downloading 3/9..."
   - Use Promise.all or sequential downloads
   - Zip files together (optional, adds complexity)

4. **Add Download Progress**
   - Show progress bar or count during batch download
   - Disable other actions while downloading
   - Show completion toast: "Downloaded 9 images"
   - Handle partial failures (some images fail to download)

5. **Handle Download Errors**
   - Network errors: show error toast, retry option
   - CORS errors: explain that CloudFront URL needed
   - Quota errors: browser download limits
   - Log errors to CloudWatch for debugging

6. **Support Mobile Downloads**
   - Test download on iOS Safari (different behavior)
   - Test download on Android Chrome
   - Handle long-press to save (mobile browsers)
   - Provide alternative: open image in new tab

7. **Write Tests**
   - Test single image download creates blob and triggers download
   - Test batch download calls download for each image
   - Test progress updates during batch download
   - Test error handling (network failure)
   - Mock fetch and blob creation

**Verification Checklist:**
- [ ] Single image download works with custom filename
- [ ] Batch download downloads all images
- [ ] Progress indicator shows during batch download
- [ ] Error toasts appear on download failure
- [ ] Downloads work on mobile browsers
- [ ] Tests pass for download functionality

**Testing Instructions:**
```bash
npm test download

# Manual testing
# 1. Generate images
# 2. Click download button on single ImageCard
# 3. Verify image downloads with correct filename
# 4. Click "Download All" button
# 5. Verify progress indicator appears
# 6. Verify all 9 images download
# 7. Test on mobile (iOS Safari, Android Chrome)
```

**Commit Message Template:**
```
feat(frontend): enhance download with batch and custom filenames

- Create download utility for single and batch downloads
- Add custom filename format: {model}_{timestamp}.png
- Create BatchDownload component with "Download All" button
- Show download progress during batch download
- Handle download errors with retry option
- Support mobile browsers (iOS Safari, Android Chrome)
- Add tests for download functionality
```

**Estimated Tokens:** ~18,000

---

### Task 8: Advanced UI - Keyboard Shortcuts

**Goal:** Implement global keyboard shortcuts for common actions (generate, enhance, download, navigate) and create help dialog showing all shortcuts.

**Files to Modify/Create:**
- `frontend/src/hooks/useKeyboardShortcuts.js` - Keyboard event handler
- `frontend/src/components/common/KeyboardShortcutsHelp.jsx` - Help dialog
- `frontend/src/components/layout/Header.jsx` - Add help button
- `frontend/src/__tests__/hooks/useKeyboardShortcuts.test.js` - Tests

**Prerequisites:**
- Tasks 3-7 complete (features to add shortcuts for)

**Implementation Steps:**

1. **Define Keyboard Shortcuts**
   - Document all shortcuts:
     - `Ctrl+Enter` (or `Cmd+Enter`): Generate images
     - `Ctrl+E`: Enhance prompt
     - `Ctrl+R`: Random prompt
     - `Ctrl+D`: Download focused image
     - `Ctrl+A`: Download all images
     - `Ctrl+K`: Open keyboard shortcuts help
     - `Escape`: Close modal/dialog
     - `Arrow keys`: Navigate images in modal
   - Detect OS for Ctrl vs Cmd

2. **Create useKeyboardShortcuts Hook**
   - Accept configuration: `{ key, callback, enabled }`
   - Listen to `keydown` events on window
   - Match key combination (ctrl/cmd + key)
   - Prevent default browser behavior
   - Clean up listeners on unmount
   - Support disabling shortcuts (e.g., when typing in input)

3. **Integrate Shortcuts into Components**
   - GenerationPanel: Ctrl+Enter to generate
   - PromptEnhancer: Ctrl+E to enhance
   - RandomPromptButton: Ctrl+R for random prompt
   - DownloadButton: Ctrl+D for download
   - BatchDownload: Ctrl+A for download all
   - Disable shortcuts when input fields focused (don't interfere with typing)

4. **Create Keyboard Shortcuts Help Dialog**
   - Modal dialog listing all shortcuts
   - Table format: Action | Shortcut
   - Group by category: Generation, Navigation, Utility
   - Show platform-specific keys (Ctrl on Windows/Linux, Cmd on Mac)
   - Accessible: keyboard navigable, ESC to close

5. **Add Help Button to Header**
   - Icon button (❓ or keyboard icon) in header
   - Tooltip: "Keyboard Shortcuts (Ctrl+K)"
   - Click opens help dialog
   - Ctrl+K shortcut also opens help

6. **Handle Shortcut Conflicts**
   - Check for conflicts with browser shortcuts
   - Example: Ctrl+S (save) - use Shift+Ctrl+S instead
   - Avoid Ctrl+W, Ctrl+T, Ctrl+N (browser window/tab management)
   - Document any conflicts in help dialog

7. **Write Tests**
   - Test shortcut triggers callback
   - Test modifier keys (Ctrl/Cmd) detected correctly
   - Test shortcuts disabled when input focused
   - Test multiple shortcuts don't conflict
   - Simulate keyboard events in tests

**Verification Checklist:**
- [ ] All defined shortcuts work correctly
- [ ] Shortcuts disabled when typing in input fields
- [ ] Help dialog shows all shortcuts
- [ ] Platform-specific modifiers (Ctrl/Cmd) detected
- [ ] No conflicts with browser shortcuts
- [ ] Tests pass for keyboard shortcut handling

**Testing Instructions:**
```bash
npm test useKeyboardShortcuts

# Manual testing (on both Windows/Mac if possible)
# 1. Press Ctrl+K (Cmd+K on Mac)
# 2. Verify help dialog opens
# 3. Press Ctrl+R, verify random prompt
# 4. Type in PromptInput, press Ctrl+E
# 5. Verify prompt enhanced
# 6. Generate images, press Ctrl+Enter with focus on prompt
# 7. Verify generation starts
# 8. Press Ctrl+A (Cmd+A) to download all
# 9. Verify batch download starts
```

**Commit Message Template:**
```
feat(frontend): add global keyboard shortcuts

- Create useKeyboardShortcuts hook for event handling
- Implement shortcuts: Ctrl+Enter (generate), Ctrl+E (enhance), etc.
- Create KeyboardShortcutsHelp dialog with all shortcuts
- Add help button to Header (opens with Ctrl+K)
- Detect platform for Ctrl vs Cmd modifier
- Disable shortcuts when input fields focused
- Add tests for keyboard shortcut handling
```

**Estimated Tokens:** ~18,000

---

## Phase Verification

After completing all tasks:

1. **Performance Verification**
   ```bash
   # Run bundle analysis
   npm run build
   npm run analyze

   # Verify bundle size reduction
   # Compare to Phase 3 baseline
   # Target: 30%+ reduction

   # Run Lighthouse audit
   lighthouse http://localhost:4173 --output html
   # Target: Performance > 92 (improvement from Phase 3)
   ```

2. **Feature Verification**
   - Test image expansion modal (click image, keyboard navigation)
   - Test random prompt button (multiple clicks, Ctrl+R)
   - Test parameter presets (Fast, Quality, Creative)
   - Test copy-to-clipboard (image URL, prompt) with toast
   - Test download (single image, batch download all)
   - Test all keyboard shortcuts (Ctrl+K for help)

3. **Test Suite Verification**
   ```bash
   npm test
   # All tests should pass
   # New features should have tests
   ```

4. **Mobile Verification**
   - Test all new features on mobile device
   - Test responsive layouts (modal, presets, toasts)
   - Test touch gestures (swipe in modal)
   - Test download on iOS Safari and Android Chrome

5. **Accessibility Verification**
   - Tab navigation works for all new components
   - ARIA labels present for icon buttons
   - Keyboard shortcuts accessible via help dialog
   - Screen reader friendly (test with VoiceOver or NVDA)

**Integration Points for Next Phase:**
- Optimized bundle ready for production deployment (Phase 5)
- All features tested and ready for CI/CD (Phase 5)
- Performance improvements verified for monitoring (Phase 5)

**Known Limitations:**
- Keyboard shortcuts may conflict with browser extensions
- Batch download limited by browser download limits (usually 10+ simultaneous)
- Toast notifications don't persist across page reloads

---

## Success Metrics

- [ ] Bundle size reduced by 30%+ (documented in PERFORMANCE.md)
- [ ] Lazy loading implemented (Gallery in separate chunk)
- [ ] React.memo reduces re-renders by 40%+
- [ ] Image expansion modal with keyboard nav working
- [ ] Random prompt button with 50+ seed prompts
- [ ] Parameter presets (Fast, Quality, Creative) working
- [ ] Copy-to-clipboard with toast notifications
- [ ] Download all images feature working
- [ ] 8+ keyboard shortcuts implemented with help dialog
- [ ] Lighthouse performance > 92
- [ ] All new features have corresponding tests
- [ ] Mobile responsive and tested on iOS/Android

This phase delivers a polished, performant, production-ready frontend with advanced features that significantly enhance user experience.
