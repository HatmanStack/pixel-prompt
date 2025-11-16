<div align="center" style="display: block;margin-left: auto;margin-right: auto;width: 50%;">
<h1>Pixel Prompt</h1>

<div style="display: flex; justify-content: center; align-items: center;">
  <h4 style="margin: 0; display: flex;">
    <a href="https://www.apache.org/licenses/LICENSE-2.0.html">
      <img src="https://img.shields.io/badge/license-Apache%202.0-blue" alt="Apache 2.0 liscense" />
    </a>
    <a href="https://expo.dev/">
    <img src="https://img.shields.io/badge/Expo-51+-green" alt="Expo Version" />
    </a>
    <a href="https://reactnative.dev/">
      <img src="https://img.shields.io/badge/React%20Native-58C4DC" alt="React Native Version" />
    </a>
    <a href="https://www.docker.com/">
      <img src="https://img.shields.io/badge/Docker-1D63ED" alt="Docker" />
    </a>
    <a href="https://www.python.org/downloads/">
    <img src="https://img.shields.io/badge/Python%203.12+-FAD641" alt="Python Version">
    </a>
    <a href="https://aws.amazon.com/lambda/">
    <img src="https://img.shields.io/badge/AWS%20Lambda-red" als="AWS Lambda">
    </a>
  </h4>
</div>

  <p><b>Text-to-Image Variety Pack<br> <a href="https://production.d2iujulgl0aoba.amplifyapp.com/"> Pixel Prompt » </a> </b> </p>
 
</div>

## Architecture and Deployment Options

To ensure a comprehensive understanding of the application's architecture, here are the key components and deployment strategies:

1. **Frontend**: The frontend component is developed using React Native, providing a user-friendly interface for  interaction with the underlying ML models and backend services. 

2. **Backend**: The backend component is built using FastAPI and Docker, offering a robust and scalable foundation for hosting and managing ML models and associated APIs. FastAPI provides a fast and efficient framework for building APIs, while Docker ensures consistent and reproducible deployments across different environments.

3. **Containerization**: Both the frontend and backend components can be packaged into lightweight and portable Docker containers. Containerization allows for easy deployment and scaling of the application, ensuring consistent behavior across various environments. Docker containers encapsulate all the necessary dependencies and configurations, making it simple to deploy Pixel Prompt on different platforms and infrastructures.

4. **JavaScript (JS)**: By leveraging React Native, Pixel Prompt can be built as a self-contained JavaScript application. This allows for a unified codebase that can be compiled and deployed on multiple platforms, including mobile devices and web browsers. The JavaScript version of Pixel Prompt provides a seamless and platform-agnostic user experience.

For a more in-depth discussion about the architectures and deployment strategies, refer to the article [Cloud Bound: React Native and FastAPI for ML](https://medium.com/@HatmanStack/cloud-bound-react-native-and-fastapi-ml-684a658f967a).

## Screenshots :camera:

<table>
  <tr>
    <p align="center">
    <td><img src="https://github.com/HatmanStack/pixel-prompt/blob/main/pics/pixel_main.png" alt="Image 1"></td></p>
    </tr>
    <tr>
    <p align="center">
    <td><img src="https://github.com/HatmanStack/pixel-prompt/blob/main/pics/pixel_main_1.png" alt="Image 3"></td></p>
  </tr>
  <tr>
    <p align="center">
    <td><img src="https://github.com/HatmanStack/pixel-prompt/blob/main/pics/pixel_main_2.png" alt="Image 1"></td></p>
    </tr>
    <tr>
    <p align="center">
    <td><img src="https://github.com/HatmanStack/pixel-prompt/blob/main/pics/pixel_main_3.png" alt="Image 3"></td></p>
  </tr>
  <tr>
    <p align="center">
    <td><img src="https://github.com/HatmanStack/pixel-prompt/blob/main/pics/pixel_main_4.png" alt="Image 1"></td></p>
    </tr>
</table>

## Prerequisites :hammer:

Before running this application locally, ensure that you have the following dependencies installed on your machine.  Each version has seperate build instructions.:

- Node
- npm (Node Package Manager) 
- python

**For all Modules**
```shell
git submodule update --init --recursive
```

**Updating all Modules**
```shell
git submodule update --remote --merge
```

## Models :sparkles:

All the models are SOTA and some are available on HuggingFace.
       
### Diffusion

- **Stable Diffusion**
- **OpenAI Dalle3**
- **AWS Nova Canvas**
- **Black Forest Labs**
- **Gemini 2.0**
- **Imagen 3.0**

### Prompts

- **meta-llama/llama-4-maverick-17b-128e-instruct**

## Quick Deployment

Deploy the entire application to AWS in minutes with the automated deployment script.

### Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) installed and configured (`aws configure`)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed
- Node.js 18+ and npm
- Python 3.12+
- AI provider API keys (OpenAI, Google, etc.)

### Deploy Backend (One Command)

```bash
# Deploy to development environment
./scripts/deploy.sh dev

# Deploy to staging environment
./scripts/deploy.sh staging

# Deploy to production environment
./scripts/deploy.sh prod
```

The deployment script will:
1. Build the Lambda function
2. Deploy CloudFormation stack to AWS
3. Create S3 bucket and CloudFront distribution
4. Extract API Gateway endpoint
5. Automatically generate `frontend/.env` with correct API endpoint

### Deploy Frontend

```bash
# Build frontend
cd frontend
npm install
npm run build

# Preview locally
npm run preview

# Deploy to your hosting platform
# (Netlify, Vercel, S3 + CloudFront, etc.)
```

### Configuration

The deployment script uses environment-specific settings from `backend/samconfig.toml`:

- **dev**: 3 models, lower rate limits, development testing
- **staging**: 9 models, production-like configuration, pre-production testing
- **prod**: 9 models, higher rate limits, production deployment

API keys are passed as parameters during the first deployment (`sam deploy --guided`) or via parameter overrides.

### Required AWS Permissions

Your AWS account needs permissions to create:
- Lambda functions
- API Gateway HTTP APIs
- S3 buckets
- CloudFront distributions
- IAM roles
- CloudFormation stacks
- CloudWatch log groups

### Troubleshooting

**Deployment fails with "credentials not configured":**
- Run `aws configure` and enter your AWS access key ID and secret access key

**Frontend can't connect to API:**
- Verify `frontend/.env` has the correct API endpoint
- Check that the backend CloudFormation stack deployed successfully: `aws cloudformation describe-stacks --stack-name pixel-prompt-{environment}`

**CloudFront images not loading:**
- CloudFront distribution takes ~15 minutes to fully deploy
- Check distribution status: `aws cloudfront list-distributions`

For more detailed deployment documentation, see `PRODUCTION_CHECKLIST.md`.

## Functionality

This App was creating using the HuggingFace Inference API.  Although Free to use, some functionality isn't available yet.  The Style and Layout switches are based on the IP adapter which isn't supported by the Inference API. If you decide to use custom endpoints this is available now.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

This application is built with Expo, a powerful framework for building cross-platform mobile applications. Learn more about Expo: [https://expo.io](https://expo.io)

<p align="center">This application is using the HuggingFace Inference API and the Diffusers Library, provided by <a href="https://huggingface.co">HuggingFace</a> </br><img src="https://github.com/HatmanStack/pixel-prompt-backend/blob/main/logo.png" alt="Image 4"></p>



