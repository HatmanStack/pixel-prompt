# React Native App with Expo

This repository contains a React Native application built using Expo. This is an example app, intended to demonstrate the inference API from Hugging Face JS Libraries.  Expo builds the application for web or mobile. An explanation of some of the componenets and deployment architectures: [Cloud Bound](https://medium.com/@HatmanStack/cloud-bound-react-native-and-fastapi-ml-684a658f967a).

## Preview

To preview the application visit the hosted version on the Hugging Face Spaces platform [here](https://huggingface.co/spaces/Hatman/react-native-serve-ml) or download the Android version [here](https://play.google.com/store/apps/details?id=gemenielabs.serveml)

## Prerequisites

Before running this application locally, ensure that you have the following dependencies installed on your machine:

### Frontend

- Node
- npm (Node Package Manager)

## Installation

To install and run the application:

### Frontend
   
   ```shell
   git clone https://github.com/hatmanstack/react-native-serve-ml-inference-api.git
   cd react-native-serve-ml
   npm install -g yarn
   yarn
   npm start
   ```

The app will be running locally at http://localhost:19006. For different environments you can switch the port at startup, use 'npm start -- --port 8080' to start Metro(Expo's Compiler) on port 8080.

Include a .env file for your Hugging Face API Key.

   ```shell
   HF_TOKEN_VARIABLE=<hf-api-token>
   ```

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- This application is built with Expo, a powerful framework for building cross-platform mobile applications. Learn more about Expo: [https://expo.io](https://expo.io)

