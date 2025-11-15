# Phase 5: Frontend - Core Image Generation UI

## Phase Goal

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

## Prerequisites

- Phase 4 complete (Vite app running, API client ready)
- Backend deployed and accessible
- Understanding of React hooks and state management
- Reference to pixel-prompt-js components for UX patterns

---

## Tasks

### Task 1: Prompt Input Component

**Goal**: Create prompt input field with clear button and character limit

**Files to Create**:
- `/frontend/src/components/generation/PromptInput.jsx`
- `/frontend/src/components/generation/PromptInput.module.css`

**Prerequisites**: Phase 4 complete

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

Before moving to Phase 6, verify:

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

- No gallery feature yet (Phase 6)
- No sound effects yet (Phase 6)
- No advanced animations (breathing background) yet (Phase 6)
- Limited customization options

---

## Next Phase

Proceed to **[Phase 6: Frontend - Gallery & Advanced Features](Phase-6.md)** to add gallery browsing, sound effects, and advanced UI features.
