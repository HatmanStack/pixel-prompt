# Pixel Prompt

Pixel Prompt is a versatile application built using React Native, which can be deployed as a standalone application or integrated with a symmetrical backend powered by FastAPI and Docker. Although currently configured with diffusion models, Pixel Prompt is designed to handle a wide range of ML workloads, offering flexibility and scalability.  [Pixel Prompt](https://hatman-pixel-prompt.hf.space)

## Architecture and Deployment Options

To ensure a comprehensive understanding of the application's architecture, here are the key components and deployment strategies:

1. **Frontend**: The frontend component is developed using React Native, providing a user-friendly interface for  interaction with the underlying ML models and backend services. 

2. **Backend**: The backend component is built using FastAPI and Docker, offering a robust and scalable foundation for hosting and managing ML models and associated APIs. FastAPI provides a fast and efficient framework for building APIs, while Docker ensures consistent and reproducible deployments across different environments.

3. **Containerization**: Both the frontend and backend components can be packaged into lightweight and portable Docker containers. Containerization allows for easy deployment and scaling of the application, ensuring consistent behavior across various environments. Docker containers encapsulate all the necessary dependencies and configurations, making it simple to deploy Pixel Prompt on different platforms and infrastructures.

4. **JavaScript (JS)**: By leveraging React Native, Pixel Prompt can be built as a self-contained JavaScript application. This allows for a unified codebase that can be compiled and deployed on multiple platforms, including mobile devices and web browsers. The JavaScript version of Pixel Prompt provides a seamless and platform-agnostic user experience.

For a more in-depth discussion about the architectures and deployment strategies, refer to the article [Cloud Bound: React Native and FastAPI for ML](https://medium.com/@HatmanStack/cloud-bound-react-native-and-fastapi-ml-684a658f967a).

## Preview :zap:

To preview the application visit the hosted version on the Hugging Face Spaces platform [here](https://hatman-pixel-prompt.hf.space).

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

All the models are opensource and available on HuggingFace.

### Diffusion

#### Image to Image

- **timbrooks/instruct-pix2pix**
- **stabilityai/stable-diffusion-xl-refiner-1.0**
       
#### Text to Image

- **stabilityai/stable-diffusion-3-medium**
- **stabilityai/stable-diffusion-xl-base-1.0**
- **SPO-Diffusion-Models/SPO-SDXL_4k-p_10ep**
- **Fictiverse/Fictiverse/Stable_Diffusion_VoxelArt_Model**
- **Fictiverse/Stable_Diffusion_PaperCut_Model**
- **dallinmackay/Van-Gogh-diffusion**
- **nousr/robo-diffusion**
- **Eugeoter/artiwaifu-diffusion-1.0**
- **nitrosocke/Arcane-Diffusion**
- **Fictiverse/Stable_Diffusion_BalloonArt_Model**
- **prompthero/openjourney**
- **juliajoanna/sdxl-flintstones_finetuning_1**
- **segmind/Segmind-Vega**
- **digiplay/AbsoluteReality_v1.8.1**
- **dreamlike-art/dreamlike-photoreal-2.0**
- **digiplay/Acorn_Photo_v1**

### Prompts

- **mistralai/Mistral-7B-Instruct-v0.3**
- **roborovski/superprompt-v1**
- **google/gemma-1.1-7b-it**

## Functionality

This App was creating using the HuggingFace Inference API.  Although Free to use, some functionality isn't available yet.  The Style and Layout switches are based on the IP adapter which isn't supported by the Inference API. If you decide to use custom endpoints this is available now.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

This application is built with Expo, a powerful framework for building cross-platform mobile applications. Learn more about Expo: [https://expo.io](https://expo.io)

<p align="center">This application is using the HuggingFace Inference API and the Diffusers Library, provided by <a href="https://huggingface.co">HuggingFace</a> </br><img src="https://github.com/HatmanStack/pixel-prompt-backend/blob/main/logo.png" alt="Image 4"></p>



