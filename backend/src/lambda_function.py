"""
Main Lambda handler for Pixel Prompt Complete.
Routes API requests to appropriate handlers for image generation,
status checking, and prompt enhancement.
"""

import json
import traceback
from datetime import datetime, timezone
import boto3
import threading

# Import configuration
from config import (
    models, s3_bucket, cloudfront_domain,
    global_limit, ip_limit, ip_include
)

# Import modules
from models.registry import ModelRegistry
from jobs.manager import JobManager
from jobs.executor import JobExecutor
from utils.storage import ImageStorage
from utils.rate_limit import RateLimiter
from utils.content_filter import ContentFilter
from api.enhance import PromptEnhancer

# Initialize components at module level (Lambda container reuse)
print("Initializing Lambda components...")

# S3 client
s3_client = boto3.client('s3')

# Model registry
model_registry = ModelRegistry()

# Job manager
job_manager = JobManager(s3_client, s3_bucket)

# Image storage
image_storage = ImageStorage(s3_client, s3_bucket, cloudfront_domain)

# Rate limiter
rate_limiter = RateLimiter(s3_client, s3_bucket, global_limit, ip_limit, ip_include)

# Content filter
content_filter = ContentFilter()

# Job executor
job_executor = JobExecutor(job_manager, image_storage, model_registry)

# Prompt enhancer
prompt_enhancer = PromptEnhancer(model_registry)

print(f"Lambda initialization complete: {model_registry.get_model_count()} models configured")


def lambda_handler(event, context):
    """
    Main Lambda handler function.
    Routes requests to appropriate handlers based on path and method.

    Args:
        event: API Gateway event object
        context: Lambda context object

    Returns:
        API Gateway response object with status code and body
    """
    # Extract path and method from API Gateway event
    path = event.get('rawPath', event.get('path', ''))
    method = event.get('requestContext', {}).get('http', {}).get('method',
             event.get('httpMethod', ''))

    # Log request metadata only (not full event to avoid credential leaks)
    print(f"Request: {method} {path}")

    try:
        # Route based on path and method
        if path == '/generate' and method == 'POST':
            return handle_generate(event)
        elif path.startswith('/status/') and method == 'GET':
            return handle_status(event)
        elif path == '/enhance' and method == 'POST':
            return handle_enhance(event)
        else:
            return response(404, {'error': 'Not found', 'path': path, 'method': method})

    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        traceback.print_exc()
        return response(500, {'error': 'Internal server error'})


def handle_generate(event):
    """
    POST /generate - Create image generation job.

    Request body:
        {
            "prompt": "text prompt",
            "steps": 25,
            "guidance": 7,
            "control": 1.0,
            "ip": "client IP address"
        }

    Returns:
        {"jobId": "uuid-v4-string"}
    """
    try:
        body = json.loads(event.get('body', '{}'))

        prompt = body.get('prompt', '')
        steps = body.get('steps', 25)
        guidance = body.get('guidance', 7)
        control = body.get('control', 1.0)

        # Get client IP
        ip = body.get('ip')
        if not ip:
            # Try to extract from event
            ip = event.get('requestContext', {}).get('http', {}).get('sourceIp', 'unknown')

        # Validate input
        if not prompt or len(prompt) == 0:
            return response(400, {'error': 'Prompt is required'})

        if len(prompt) > 1000:
            return response(400, {'error': 'Prompt too long (max 1000 characters)'})

        # Check rate limit
        is_limited = rate_limiter.check_rate_limit(ip)
        if is_limited:
            return response(429, {
                'error': 'Rate limit exceeded',
                'message': 'Too many requests. Please try again later.'
            })

        # Check content filter
        is_blocked = content_filter.check_prompt(prompt)
        if is_blocked:
            return response(400, {
                'error': 'Inappropriate content detected',
                'message': 'Your prompt contains inappropriate content and cannot be processed.'
            })

        # Build parameters
        params = {
            'steps': steps,
            'guidance': guidance,
            'control': control
        }

        # Create target timestamp for grouping images
        target = datetime.now(timezone.utc).strftime('%Y-%m-%d-%H-%M-%S')

        # Create job
        job_id = job_manager.create_job(
            prompt=prompt,
            params=params,
            models=model_registry.get_all_models()
        )

        # Start background execution in separate thread
        # This allows Lambda to return immediately while processing continues
        thread = threading.Thread(
            target=job_executor.execute_job,
            args=(job_id, prompt, params, target)
        )
        thread.daemon = True
        thread.start()

        print(f"Job {job_id} created and started in background")

        # Return job ID immediately
        return response(200, {
            'jobId': job_id,
            'message': 'Job created successfully',
            'totalModels': model_registry.get_model_count()
        })

    except json.JSONDecodeError:
        return response(400, {'error': 'Invalid JSON in request body'})
    except Exception as e:
        print(f"Error in handle_generate: {str(e)}")
        traceback.print_exc()
        return response(500, {'error': 'Internal server error'})


def handle_status(event):
    """
    GET /status/{jobId} - Get job status and results.

    Path parameters:
        jobId: UUID of the job

    Returns:
        Job status object with completion progress
    """
    try:
        path_parameters = event.get('pathParameters', {})
        job_id = path_parameters.get('jobId', 'unknown')

        # Get job status from S3
        status = job_manager.get_job_status(job_id)

        if not status:
            return response(404, {
                'error': 'Job not found',
                'jobId': job_id
            })

        # Add CloudFront URLs to image results
        for result in status.get('results', []):
            if result.get('status') == 'completed' and result.get('imageKey'):
                result['imageUrl'] = image_storage.get_cloudfront_url(result['imageKey'])

        return response(200, status)

    except Exception as e:
        print(f"Error in handle_status: {str(e)}")
        traceback.print_exc()
        return response(500, {'error': 'Internal server error'})


def handle_enhance(event):
    """
    POST /enhance - Enhance prompt using configured LLM.

    Request body:
        {
            "prompt": "short prompt"
        }

    Returns:
        {
            "enhanced": "detailed expanded prompt"
        }
    """
    try:
        body = json.loads(event.get('body', '{}'))
        prompt = body.get('prompt', '')

        # Validate input
        if not prompt or len(prompt) == 0:
            return response(400, {'error': 'Prompt is required'})

        if len(prompt) > 500:
            return response(400, {'error': 'Prompt too long for enhancement (max 500 characters)'})

        # Enhance prompt
        enhanced = prompt_enhancer.enhance_safe(prompt)

        return response(200, {
            'original': prompt,
            'enhanced': enhanced
        })

    except json.JSONDecodeError:
        return response(400, {'error': 'Invalid JSON in request body'})
    except Exception as e:
        print(f"Error in handle_enhance: {str(e)}")
        traceback.print_exc()
        return response(500, {'error': 'Internal server error'})


def response(status_code, body):
    """
    Helper function to create API Gateway response.

    Args:
        status_code: HTTP status code
        body: Response body (dict)

    Returns:
        API Gateway response object
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
        },
        'body': json.dumps(body)
    }
