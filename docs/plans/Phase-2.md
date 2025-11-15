# Phase 2: Lambda - Dynamic Model Registry & Routing

## Phase Goal

Implement the dynamic model registry system that parses environment variables, detects AI providers from model names, and routes requests to appropriate handler functions. This phase focuses on building the intelligent routing layer that allows flexible model configuration without code changes.

**Success Criteria**:
- Lambda successfully parses MODEL_COUNT and MODEL_N_* environment variables
- Provider detection logic correctly identifies AI providers from model names
- Each provider has a dedicated handler function (stubbed initially)
- Generic fallback handler exists for unknown models
- Model registry is testable and maintainable

**Estimated Tokens**: ~30,000

---

## Prerequisites

- Phase 1 complete (infrastructure deployed)
- Familiarity with existing model handlers in `/pixel-prompt-lambda/utils.py`
- Understanding of provider APIs (OpenAI, Stability AI, BFL, Google, Recraft)
- AWS Bedrock access enabled (for Nova Canvas and Stable Diffusion)

---

## Tasks

### Task 1: Model Registry Module

**Goal**: Create the model registry that loads and manages model configurations

**Files to Create**:
- `/backend/src/models/registry.py` - Model registry implementation
- `/backend/src/models/__init__.py` - Package initialization

**Prerequisites**: Phase 1 Task 5 complete

**Implementation Steps**:

1. Create `models/registry.py` with `ModelRegistry` class:
   - Constructor loads models from environment variables
   - Parse `MODEL_COUNT` to determine how many models to load
   - Loop through MODEL_1_NAME through MODEL_N_NAME
   - Build list of model configurations (name, key, detected provider)
   - Store PROMPT_MODEL_INDEX to identify which model to use for enhancement
2. Implement `get_model_by_index(index)` method
3. Implement `get_prompt_model()` method (returns model for prompt enhancement)
4. Implement `get_all_models()` method (returns list of all models)
5. Add validation:
   - Ensure MODEL_COUNT matches actual number of configured models
   - Warn if PROMPT_MODEL_INDEX is out of range
   - Handle missing environment variables gracefully

**Data Structure**:
```python
{
    'name': 'DALL-E 3',
    'key': 'sk-xxx...',
    'provider': 'openai',
    'index': 1  # 1-based index
}
```

**Verification Checklist**:
- [ ] ModelRegistry class successfully loads models from environment
- [ ] Handles cases where MODEL_COUNT doesn't match configured models
- [ ] Returns correct model for prompt enhancement
- [ ] Validation prevents crashes from misconfiguration

**Testing Instructions**:
- Unit test: Mock `os.environ` with test model configs
- Test with 1 model, 9 models, 20 models
- Test with mismatched MODEL_COUNT (should log warning)
- Test with missing MODEL_N_NAME (should skip gracefully)

**Commit Message Template**:
```
feat(lambda): implement model registry system

- Create ModelRegistry class to parse environment variables
- Load MODEL_COUNT and MODEL_N_* configs dynamically
- Add validation for model count and prompt model index
- Support 1-20 configurable models
```

**Estimated Tokens**: ~4,000

---

### Task 2: Provider Detection Logic

**Goal**: Implement intelligent provider detection from model names

**Files to Modify**:
- `/backend/src/models/registry.py`

**Prerequisites**: Task 1 complete

**Implementation Steps**:

1. Create `detect_provider(model_name)` function:
   - Takes model name string as input
   - Returns provider identifier string
   - Use case-insensitive pattern matching
2. Implement detection patterns based on known model names:
   - OpenAI: "dalle", "dall-e", "gpt", "chatgpt"
   - Google Gemini: "gemini"
   - Google Imagen: "imagen"
   - Stability AI: "stable diffusion", "sd", "sdxl"
   - Black Forest Labs: "flux", "black forest", "bfl"
   - Recraft: "recraft"
   - AWS Bedrock Nova: "nova", "amazon nova"
   - Hunyuan: "hunyuan"
   - Qwen: "qwen"
3. Return "generic" for unknown patterns (fallback handler)
4. Log detected provider for debugging: `print(f"Detected provider '{provider}' for model '{model_name}'")`
5. Integrate into ModelRegistry constructor (set provider field for each model)

**Detection Logic Pattern**:
```python
def detect_provider(model_name: str) -> str:
    name_lower = model_name.lower()

    if 'dalle' in name_lower or 'dall-e' in name_lower or 'gpt' in name_lower:
        return 'openai'
    elif 'gemini' in name_lower:
        return 'google_gemini'
    # ... continue for all providers
    else:
        return 'generic'
```

**Verification Checklist**:
- [ ] Correctly detects all known providers
- [ ] Returns 'generic' for unknown model names
- [ ] Case-insensitive matching works
- [ ] No false positives (e.g., "my dalle model" → openai, not generic)

**Testing Instructions**:
- Unit test with known model names:
  - "DALL-E 3" → openai
  - "Gemini 2.0 Flash" → google_gemini
  - "Stable Diffusion XL" → stability
  - "Flux Pro" → bfl
  - "Unknown Model X" → generic
- Test edge cases: empty string, special characters, unicode

**Commit Message Template**:
```
feat(lambda): add intelligent provider detection

- Implement detect_provider() with pattern matching
- Support OpenAI, Google, Stability AI, BFL, Recraft, AWS
- Add fallback to 'generic' for unknown models
- Case-insensitive detection logic
```

**Estimated Tokens**: ~3,000

---

### Task 3: Provider Handler Stubs

**Goal**: Create stub handler functions for each AI provider

**Files to Create**:
- `/backend/src/models/handlers.py` - Provider-specific handlers

**Prerequisites**: Task 2 complete

**Implementation Steps**:

1. Create `handlers.py` with one function per provider:
   - `handle_openai(model_config, prompt, params) -> dict`
   - `handle_google_gemini(model_config, prompt, params) -> dict`
   - `handle_google_imagen(model_config, prompt, params) -> dict`
   - `handle_stability(model_config, prompt, params) -> dict`
   - `handle_bfl(model_config, prompt, params) -> dict`
   - `handle_recraft(model_config, prompt, params) -> dict`
   - `handle_bedrock_nova(model_config, prompt, params) -> dict`
   - `handle_bedrock_sd(model_config, prompt, params) -> dict`
   - `handle_generic(model_config, prompt, params) -> dict`
2. Each handler should:
   - Accept standardized parameters (model_config dict, prompt string, params dict)
   - Log entry: `print(f"Calling {provider} with model {model_config['name']}")`
   - Return placeholder response: `{"status": "success", "provider": "...", "image": "base64-placeholder"}`
   - Include error handling (try/except)
3. Define standard return schema:
   ```python
   {
       "status": "success" | "error",
       "image": "base64-encoded-image-string",
       "model": "model-name",
       "provider": "provider-name",
       "error": "error-message"  # only if status=error
   }
   ```
4. Create `get_handler(provider: str)` function that returns appropriate handler function

**Verification Checklist**:
- [ ] All handler functions follow same signature
- [ ] Each handler returns standardized response format
- [ ] get_handler() returns correct function for each provider
- [ ] Unknown providers return generic handler

**Testing Instructions**:
- Unit test each handler with mock inputs
- Test get_handler() mapping for all providers
- Verify error handling (e.g., missing API key should return error response, not crash)

**Commit Message Template**:
```
feat(lambda): create provider handler stubs

- Implement handler functions for all providers
- Standardize handler signature and return format
- Add get_handler() dispatcher function
- Include error handling in each handler
```

**Estimated Tokens**: ~4,000

---

### Task 4: Implement OpenAI Handler

**Goal**: Implement the real OpenAI (DALL-E 3) handler based on existing code

**Files to Modify**:
- `/backend/src/models/handlers.py`
- `/backend/requirements.txt` (add `openai` package)

**Prerequisites**: Task 3 complete, reference `/pixel-prompt-lambda/utils.py` lines 13-32

**Implementation Steps**:

1. Add `openai` to `requirements.txt`
2. Import `openai` library at top of handlers.py
3. Update `handle_openai()` function:
   - Extract API key from model_config
   - Set `openai.api_key = model_config['key']`
   - Call `openai.images.generate()` with:
     - model: "dall-e-3"
     - prompt: prompt parameter
     - size: "1024x1024"
     - quality: "standard"
     - n: 1
   - Extract image URL from response
   - Download image using `requests.get()`
   - Convert to base64
   - Return standardized response
4. Add timeout to requests (30 seconds)
5. Handle specific errors:
   - Invalid API key
   - Rate limit exceeded
   - Content policy violation
   - Network timeout

**Verification Checklist**:
- [ ] Handler successfully generates images with valid API key
- [ ] Returns base64-encoded image in response
- [ ] Handles errors gracefully (returns error response, not crash)
- [ ] Timeout prevents indefinite hanging

**Testing Instructions**:
- Integration test with real OpenAI API key
- Test with valid prompt → should return image
- Test with invalid API key → should return error response
- Test with prohibited prompt → should return policy violation error
- Manual verification: Decode base64 and save as .png to visually inspect

**Commit Message Template**:
```
feat(lambda): implement OpenAI DALL-E 3 handler

- Add openai SDK to requirements
- Implement image generation with DALL-E 3
- Convert response to base64 format
- Handle API errors and timeouts
```

**Estimated Tokens**: ~4,000

---

### Task 5: Implement AWS Bedrock Handlers

**Goal**: Implement handlers for AWS Bedrock models (Nova Canvas, Stable Diffusion)

**Files to Modify**:
- `/backend/src/models/handlers.py`

**Prerequisites**: Task 4 complete, reference `/pixel-prompt-lambda/utils.py` lines 34-81

**Implementation Steps**:

1. Import `boto3` and `json` at top of handlers.py
2. Update `handle_bedrock_nova()` function:
   - Create boto3 session with credentials from environment (AWS_ID, AWS_SECRET)
   - Use region: `us-east-1` (Nova Canvas requirement)
   - Create bedrock-runtime client
   - Build request body for `amazon.nova-canvas-v1:0`:
     ```python
     {
       "taskType": "TEXT_IMAGE",
       "textToImageParams": {"text": prompt},
       "imageGenerationConfig": {
         "numberOfImages": 1,
         "height": 1024,
         "width": 1024,
         "cfgScale": params.get('guidance', 8.0),
         "seed": 0
       }
     }
     ```
   - Invoke model with `bedrock.invoke_model()`
   - Extract base64 image from response
3. Update `handle_bedrock_sd()` function:
   - Similar structure but use model `stability.sd3-5-large-v1:0`
   - Use region: `us-west-2` (Stable Diffusion requirement)
   - Build request body:
     ```python
     {
       "prompt": prompt,
       "mode": "text-to-image",
       "aspect_ratio": "1:1",
       "output_format": "png",
       "seed": 0,
       "negative_prompt": params.get('negative_prompt', '')
     }
     ```
4. Update provider detection to distinguish between bedrock_nova and bedrock_sd
5. Handle Bedrock-specific errors (model not enabled, region mismatch, quota exceeded)

**Verification Checklist**:
- [ ] Nova Canvas handler works with us-east-1 region
- [ ] Stable Diffusion handler works with us-west-2 region
- [ ] Both handlers return base64 images
- [ ] Credentials from environment variables are used correctly

**Testing Instructions**:
- Integration test with AWS account that has Bedrock access
- Test both models with same prompt
- Verify region-specific requirements
- Test error handling for disabled models

**Commit Message Template**:
```
feat(lambda): implement AWS Bedrock handlers

- Add Nova Canvas handler (us-east-1)
- Add Stable Diffusion 3.5 Large handler (us-west-2)
- Configure boto3 session with credentials
- Handle region-specific requirements
```

**Estimated Tokens**: ~5,000

---

### Task 6: Implement Google Handlers

**Goal**: Implement handlers for Google Gemini 2.0 and Imagen 3.0

**Files to Modify**:
- `/backend/src/models/handlers.py`
- `/backend/requirements.txt` (add `google-genai` package)

**Prerequisites**: Task 5 complete, reference `/pixel-prompt-lambda/utils.py` lines 83-127

**Implementation Steps**:

1. Add `google-genai` to requirements.txt
2. Import `google.genai` and related types
3. Update `handle_google_gemini()` function:
   - Create client: `genai.Client(api_key=model_config['key'])`
   - Call `client.models.generate_content()` with:
     - model: "gemini-2.0-flash-exp-image-generation"
     - contents: prompt
     - config: `types.GenerateContentConfig(response_modalities=['Text', 'Image'])`
   - Extract inline image data from response parts
   - Convert bytes to base64
4. Update `handle_google_imagen()` function:
   - Create client same as Gemini
   - Call `client.models.generate_images()` with:
     - model: "imagen-3.0-generate-002"
     - prompt: prompt
     - config: `types.GenerateImagesConfig(number_of_images=1)`
   - Extract image bytes from generated_images
   - Save to /tmp/ temporarily, read back as base64 (matches existing implementation)
   - Clean up temp file
5. Handle Google-specific errors (quota exceeded, safety filters)

**Verification Checklist**:
- [ ] Gemini handler generates images with multimodal model
- [ ] Imagen handler generates images with dedicated image model
- [ ] Both return base64-encoded images
- [ ] Temp files are cleaned up after Imagen generation

**Testing Instructions**:
- Integration test with Google Cloud API key
- Test both handlers with same prompt
- Compare image quality/style between models
- Test safety filter (inappropriate prompt should be rejected)

**Commit Message Template**:
```
feat(lambda): implement Google Gemini and Imagen handlers

- Add google-genai SDK to requirements
- Implement Gemini 2.0 image generation
- Implement Imagen 3.0 generation
- Handle temp file cleanup for Imagen
```

**Estimated Tokens**: ~4,000

---

### Task 7: Implement Remaining Handlers

**Goal**: Implement handlers for Stability AI, BFL, Recraft, and generic fallback

**Files to Modify**:
- `/backend/src/models/handlers.py`

**Prerequisites**: Task 6 complete, reference `/pixel-prompt-lambda/utils.py`

**Implementation Steps**:

1. Update `handle_stability()` function:
   - Use Stability AI API endpoint: `https://api.stability.ai/v2beta/stable-image/generate/sd3`
   - Headers: `{"authorization": f"Bearer {api_key}", "accept": "image/*"}`
   - POST with multipart/form-data
   - Data: prompt, model (sd3-large-turbo), output_format (png), aspect_ratio (1:1)
   - Response is raw image bytes → convert to base64

2. Update `handle_bfl()` function:
   - BFL API endpoint: `https://api.us1.bfl.ai/v1/flux-dev` or `/flux-pro-1.1`
   - Determine endpoint from model name (dev vs pro)
   - Headers: `{"x-key": api_key, "Content-Type": "application/json"}`
   - POST request to start job, get job ID
   - Poll `/v1/get_result?id={job_id}` until status is "Ready"
   - Extract image URL from result, download, convert to base64
   - Add timeout to polling (max 2 minutes)

3. Update `handle_recraft()` function:
   - Use OpenAI-compatible API: `https://external.api.recraft.ai/v1`
   - Create OpenAI client with custom base_url
   - Call `client.images.generate()` (same as OpenAI)
   - Download image from returned URL

4. Update `handle_generic()` function:
   - Attempt to call as OpenAI-compatible API (many providers follow this pattern)
   - Use model_config['name'] as model parameter
   - If successful, return image
   - If fails, return error response with helpful message

**Verification Checklist**:
- [ ] Stability AI handler works with API key
- [ ] BFL handler correctly polls for job completion
- [ ] Recraft handler uses custom base URL
- [ ] Generic handler attempts OpenAI-compatible call

**Testing Instructions**:
- Integration test each handler with real API keys
- Test BFL polling logic (should wait for completion)
- Test generic handler with known OpenAI-compatible API
- Test generic handler with non-compatible API (should fail gracefully)

**Commit Message Template**:
```
feat(lambda): implement Stability AI, BFL, Recraft, and generic handlers

- Add Stability AI SD3 handler with multipart requests
- Add BFL handler with async polling
- Add Recraft handler with custom OpenAI base URL
- Implement generic fallback for OpenAI-compatible APIs
```

**Estimated Tokens**: ~6,000

---

## Phase Verification

### Complete Phase Checklist

Before moving to Phase 3, verify:

- [ ] ModelRegistry successfully loads models from environment
- [ ] Provider detection works for all known providers
- [ ] All provider handlers are implemented:
  - OpenAI (DALL-E 3)
  - AWS Bedrock Nova Canvas
  - AWS Bedrock Stable Diffusion
  - Google Gemini 2.0
  - Google Imagen 3.0
  - Stability AI
  - Black Forest Labs (Flux)
  - Recraft
  - Generic fallback
- [ ] Each handler returns standardized response format
- [ ] Error handling prevents crashes
- [ ] Integration tests pass with real API keys

### Integration Testing

1. **Test Model Registry**:
   ```python
   # Deploy with 3 test models
   from models.registry import ModelRegistry
   registry = ModelRegistry()
   assert len(registry.get_all_models()) == 3
   assert registry.get_prompt_model()['name'] == "DALL-E 3"
   ```

2. **Test Provider Detection**:
   ```python
   from models.registry import detect_provider
   assert detect_provider("DALL-E 3") == "openai"
   assert detect_provider("Gemini Flash") == "google_gemini"
   assert detect_provider("Unknown Model") == "generic"
   ```

3. **Test Handlers**:
   ```python
   from models.handlers import handle_openai
   config = {'name': 'DALL-E 3', 'key': 'sk-xxx'}
   result = handle_openai(config, "a beautiful sunset", {})
   assert result['status'] == 'success'
   assert 'image' in result
   ```

### Known Limitations

- Handlers are implemented but not integrated into Lambda handler (Phase 3)
- No parallel execution yet (Phase 3)
- No job status storage (Phase 3)

---

## Next Phase

Proceed to **[Phase 3: Lambda - Async Job Management & Parallel Processing](Phase-3.md)** to integrate handlers with job management and parallel execution.
