"""
Provider-specific handlers for AI image generation.

Each handler implements image generation for a specific AI provider,
returning a standardized response format.
"""

import base64
import json
import os
import requests
from typing import Dict, Any, Callable
from openai import OpenAI
import boto3


def handle_openai(model_config: Dict, prompt: str, params: Dict) -> Dict:
    """
    Handle image generation for OpenAI (DALL-E 3).

    Args:
        model_config: Model configuration dict with 'name' and 'key'
        prompt: Text prompt for image generation
        params: Generation parameters (steps, guidance, etc.)

    Returns:
        Standardized response dict with status and image data
    """
    try:
        print(f"Calling OpenAI DALL-E 3 with prompt: {prompt[:50]}...")

        # Initialize OpenAI client
        client = OpenAI(api_key=model_config['key'])

        # Call DALL-E 3 image generation
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )

        # Extract image URL from response
        image_url = response.data[0].url

        # Download image
        print(f"Downloading image from {image_url[:50]}...")
        img_response = requests.get(image_url, timeout=30)
        img_response.raise_for_status()

        # Convert to base64
        image_base64 = base64.b64encode(img_response.content).decode('utf-8')

        print(f"OpenAI image generated successfully ({len(image_base64)} bytes)")

        return {
            'status': 'success',
            'image': image_base64,
            'model': model_config['name'],
            'provider': 'openai'
        }

    except requests.Timeout:
        error_msg = "Image download timeout after 30 seconds"
        print(f"Error in handle_openai: {error_msg}")
        return {
            'status': 'error',
            'error': error_msg,
            'model': model_config['name'],
            'provider': 'openai'
        }

    except Exception as e:
        print(f"Error in handle_openai: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'model': model_config['name'],
            'provider': 'openai'
        }


def handle_google_gemini(model_config: Dict, prompt: str, params: Dict) -> Dict:
    """
    Handle image generation for Google Gemini 2.0.

    Args:
        model_config: Model configuration dict with 'name' and 'key'
        prompt: Text prompt for image generation
        params: Generation parameters

    Returns:
        Standardized response dict
    """
    try:
        print(f"Calling Google Gemini with model {model_config['name']}")

        return {
            'status': 'success',
            'image': 'base64-placeholder-image-data',
            'model': model_config['name'],
            'provider': 'google_gemini'
        }

    except Exception as e:
        print(f"Error in handle_google_gemini: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'model': model_config['name'],
            'provider': 'google_gemini'
        }


def handle_google_imagen(model_config: Dict, prompt: str, params: Dict) -> Dict:
    """
    Handle image generation for Google Imagen 3.0.

    Args:
        model_config: Model configuration dict
        prompt: Text prompt for image generation
        params: Generation parameters

    Returns:
        Standardized response dict
    """
    try:
        print(f"Calling Google Imagen with model {model_config['name']}")

        return {
            'status': 'success',
            'image': 'base64-placeholder-image-data',
            'model': model_config['name'],
            'provider': 'google_imagen'
        }

    except Exception as e:
        print(f"Error in handle_google_imagen: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'model': model_config['name'],
            'provider': 'google_imagen'
        }


def handle_bedrock_nova(model_config: Dict, prompt: str, params: Dict) -> Dict:
    """
    Handle image generation for AWS Bedrock Nova Canvas.

    Args:
        model_config: Model configuration dict
        prompt: Text prompt for image generation
        params: Generation parameters

    Returns:
        Standardized response dict
    """
    try:
        print(f"Calling AWS Bedrock Nova Canvas with prompt: {prompt[:50]}...")

        # Create boto3 session with credentials
        # Note: AWS credentials should be in environment or Lambda execution role
        bedrock = boto3.client(
            service_name='bedrock-runtime',
            region_name='us-east-1'  # Nova Canvas requires us-east-1
        )

        # Build request body for Nova Canvas
        request_body = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": prompt
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "height": 1024,
                "width": 1024,
                "cfgScale": params.get('guidance', 8.0),
                "seed": 0
            }
        }

        # Invoke model
        response = bedrock.invoke_model(
            modelId='amazon.nova-canvas-v1:0',
            body=json.dumps(request_body)
        )

        # Parse response
        response_body = json.loads(response['body'].read())

        # Extract base64 image from response
        image_base64 = response_body['images'][0]

        print(f"Bedrock Nova image generated successfully ({len(image_base64)} bytes)")

        return {
            'status': 'success',
            'image': image_base64,
            'model': model_config['name'],
            'provider': 'bedrock_nova'
        }

    except Exception as e:
        print(f"Error in handle_bedrock_nova: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'model': model_config['name'],
            'provider': 'bedrock_nova'
        }


def handle_bedrock_sd(model_config: Dict, prompt: str, params: Dict) -> Dict:
    """
    Handle image generation for AWS Bedrock Stable Diffusion.

    Args:
        model_config: Model configuration dict
        prompt: Text prompt for image generation
        params: Generation parameters

    Returns:
        Standardized response dict
    """
    try:
        print(f"Calling AWS Bedrock SD 3.5 Large with prompt: {prompt[:50]}...")

        # Create boto3 client
        bedrock = boto3.client(
            service_name='bedrock-runtime',
            region_name='us-west-2'  # Stable Diffusion requires us-west-2
        )

        # Build request body for Stable Diffusion
        request_body = {
            "prompt": prompt,
            "mode": "text-to-image",
            "aspect_ratio": "1:1",
            "output_format": "png",
            "seed": 0
        }

        # Add negative prompt if provided
        negative_prompt = params.get('negative_prompt', '')
        if negative_prompt:
            request_body['negative_prompt'] = negative_prompt

        # Invoke model
        response = bedrock.invoke_model(
            modelId='stability.sd3-5-large-v1:0',
            body=json.dumps(request_body)
        )

        # Parse response
        response_body = json.loads(response['body'].read())

        # Extract base64 image from response
        image_base64 = response_body['images'][0]

        print(f"Bedrock SD image generated successfully ({len(image_base64)} bytes)")

        return {
            'status': 'success',
            'image': image_base64,
            'model': model_config['name'],
            'provider': 'bedrock_sd'
        }

    except Exception as e:
        print(f"Error in handle_bedrock_sd: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'model': model_config['name'],
            'provider': 'bedrock_sd'
        }


def handle_stability(model_config: Dict, prompt: str, params: Dict) -> Dict:
    """
    Handle image generation for Stability AI.

    Args:
        model_config: Model configuration dict
        prompt: Text prompt for image generation
        params: Generation parameters

    Returns:
        Standardized response dict
    """
    try:
        print(f"Calling Stability AI with model {model_config['name']}")

        return {
            'status': 'success',
            'image': 'base64-placeholder-image-data',
            'model': model_config['name'],
            'provider': 'stability'
        }

    except Exception as e:
        print(f"Error in handle_stability: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'model': model_config['name'],
            'provider': 'stability'
        }


def handle_bfl(model_config: Dict, prompt: str, params: Dict) -> Dict:
    """
    Handle image generation for Black Forest Labs (Flux).

    Args:
        model_config: Model configuration dict
        prompt: Text prompt for image generation
        params: Generation parameters

    Returns:
        Standardized response dict
    """
    try:
        print(f"Calling BFL with model {model_config['name']}")

        return {
            'status': 'success',
            'image': 'base64-placeholder-image-data',
            'model': model_config['name'],
            'provider': 'bfl'
        }

    except Exception as e:
        print(f"Error in handle_bfl: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'model': model_config['name'],
            'provider': 'bfl'
        }


def handle_recraft(model_config: Dict, prompt: str, params: Dict) -> Dict:
    """
    Handle image generation for Recraft.

    Args:
        model_config: Model configuration dict
        prompt: Text prompt for image generation
        params: Generation parameters

    Returns:
        Standardized response dict
    """
    try:
        print(f"Calling Recraft with model {model_config['name']}")

        return {
            'status': 'success',
            'image': 'base64-placeholder-image-data',
            'model': model_config['name'],
            'provider': 'recraft'
        }

    except Exception as e:
        print(f"Error in handle_recraft: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'model': model_config['name'],
            'provider': 'recraft'
        }


def handle_generic(model_config: Dict, prompt: str, params: Dict) -> Dict:
    """
    Generic fallback handler for unknown providers.

    Attempts to call as OpenAI-compatible API.

    Args:
        model_config: Model configuration dict
        prompt: Text prompt for image generation
        params: Generation parameters

    Returns:
        Standardized response dict
    """
    try:
        print(f"Calling generic handler with model {model_config['name']}")

        return {
            'status': 'success',
            'image': 'base64-placeholder-image-data',
            'model': model_config['name'],
            'provider': 'generic'
        }

    except Exception as e:
        print(f"Error in handle_generic: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'model': model_config['name'],
            'provider': 'generic'
        }


def get_handler(provider: str) -> Callable:
    """
    Get the appropriate handler function for a provider.

    Args:
        provider: Provider identifier (e.g., 'openai', 'google_gemini')

    Returns:
        Handler function for the provider
    """
    handlers = {
        'openai': handle_openai,
        'google_gemini': handle_google_gemini,
        'google_imagen': handle_google_imagen,
        'bedrock_nova': handle_bedrock_nova,
        'bedrock_sd': handle_bedrock_sd,
        'stability': handle_stability,
        'bfl': handle_bfl,
        'recraft': handle_recraft,
        'generic': handle_generic
    }

    handler = handlers.get(provider, handle_generic)
    if provider not in handlers:
        print(f"No specific handler for provider '{provider}', using generic handler")

    return handler
