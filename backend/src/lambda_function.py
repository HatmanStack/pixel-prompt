"""
Main Lambda handler for Pixel Prompt Complete.
Routes API requests to appropriate handlers for image generation,
status checking, and prompt enhancement.
"""

import json
import traceback
from config import models, s3_bucket, cloudfront_domain


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
    print(f"Event: {json.dumps(event)}")

    # Extract path and method from API Gateway event
    path = event.get('rawPath', event.get('path', ''))
    method = event.get('requestContext', {}).get('http', {}).get('method',
             event.get('httpMethod', ''))

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
        ip = body.get('ip', 'unknown')

        # Placeholder response
        return response(200, {
            'message': 'Generate endpoint (placeholder)',
            'received': {
                'prompt': prompt,
                'steps': steps,
                'guidance': guidance,
                'control': control,
                'ip': ip,
                'models_configured': len(models)
            },
            's3_bucket': s3_bucket,
            'cloudfront_domain': cloudfront_domain
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

        # Placeholder response
        return response(200, {
            'jobId': job_id,
            'status': 'pending',
            'message': 'Status endpoint (placeholder)',
            'totalModels': len(models),
            'completedModels': 0,
            'results': []
        })

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

        # Placeholder response
        return response(200, {
            'message': 'Enhance endpoint (placeholder)',
            'original': prompt,
            'enhanced': f'Enhanced version of: {prompt}',
            'model_count': len(models)
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
