import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect} from 'react';
import {ActivityIndicator, StyleSheet, View, ScrollView, Text, Pressable, Dimensions, Image} from 'react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';

import SliderComponent from './components/Slider';
import PromptInputComponent from './components/PromptInput';
import BreathingComponent from './components/Breathing';
import DropDownComponent from './components/DropDown';

import { HfInference } from "@huggingface/inference";
const HF_TOKEN = Constants.expoConfig.extra.HF_TOKEN_VAR;
const inference = new HfInference(HF_TOKEN);
const assetImage = require('./assets/avocado.jpg');

export default function App() {
  useFonts({'Sigmar': require('./assets/Sigmar/Sigmar-Regular.ttf')});
  const [inferredImage, setInferredImage] = useState(assetImage);
  const [steps, setSteps] = useState(45);
  const [guidance, setGuidance] = useState(10);
  const [skip, setSkip] = useState(false);
  const [modelID, setModelID] = useState('stabilityai/stable-diffusion-xl-base-1.0')
  const [prompt, setPrompt] = useState('Avocado Armchair');
  const [parameters, setParameters] = useState('')
  const [activity, setActivity] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [returnedPrompt, setReturnedPrompt] = useState('Avocado Armchair');
  const windowWidth = Dimensions.get('window').width;

  const passPromptWrapper = (x) => {setPrompt(x)};
  const passStepsWrapper = (x) => {setSteps(x)};
  const passGuidanceWrapper = (x) => {setGuidance(x)};
  const passModelIDWrapper = (x) => {
      setModelError(false);
      setModelID(x)};

  let imageSource;
  if (skip) {
    imageSource = { uri: inferredImage };
  } else {
    imageSource = assetImage;
  }

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          // Notify user or automatically reload
          await Updates.reloadAsync(); 
        }
      } catch (e) {
        console.log(e)
      }
    };

    checkForUpdates();
  }, []);

  useEffect(() => { 
    if(skip){
      setActivity(true);
      setModelError(false);
      let alteredPrompt = '';
      if (modelID.includes('dallinmackay')) {
        alteredPrompt = 'lvngvncnt, ' + prompt;
      } else if (modelID.includes('nousr')) {
        alteredPrompt = 'nousr robot, ' + prompt;
      } else if (modelID.includes('nitrosocke')) {
        alteredPrompt = 'arcane, ' + prompt;
      } else if (modelID.includes('dreamlike')) {
        alteredPrompt = 'photo, ' + prompt;
      } else if (modelID.includes('prompthero')) {
        alteredPrompt = 'mdjrny-v4 style, ' + prompt;
      } else {
        alteredPrompt = prompt;
      }
      inference.textToImage({
        model: modelID,
        inputs: alteredPrompt,
        
        parameters: {
          negative_prompt: 'blurry',
          guidance: guidance,
          steps: steps,
        }
      }).then((response) => {
        console.log(response.status);
        setReturnedPrompt(prompt);
        if (response instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            setActivity(false);
            setInferredImage(reader.result);
          };
          reader.onerror = (error) => {
            console.log('Error reading Blob:', error);
          };
          reader.readAsDataURL(response);
        };
      }).catch(function (error) {
        setActivity(false);
        setModelError(true);
        console.log(error);
      });
    }
  setSkip(true);
  },[parameters]);

  return (
      // Main container
      <View style={styles.titlecontainer}>
        <BreathingComponent /> 
        <ScrollView scrollY={true} style={styles.ScrollView} showsVerticalScrollIndicator={false}> 
          {windowWidth > 1000 ? (<View style={styles.rowContainer}>
              {/* Left column */}
              <View style={styles.columnContainer}>
                  <View>
                    <PromptInputComponent passPrompt={passPromptWrapper} />
                  </View>
                  <View style={styles.rowContainer}>
                    <DropDownComponent passModelID={passModelIDWrapper} />
                      <View style={styles.columnContainer}>
                      {activity ?
                        <ActivityIndicator size="large" color="#B58392" style={styles.activityIndicator} /> :
                        <Pressable
                          onPress={() => { setParameters(`${prompt}-${steps}-${guidance}-${modelID}`); } }
                          style={({ pressed }) => [{ backgroundColor: pressed ? '#9DA58D' : '#958DA5', }, styles.button]}>
                          {({ pressed }) => (<Text style={styles.promptText}>{pressed ? 'INFERRED!' : 'Inference'}</Text>)}
                        </Pressable>}
                      {modelError ? <Text style={styles.promptText}>Model Error!</Text>:<></>}
                      </View>
                    </View>
                  <View>
                    <SliderComponent passSteps={passStepsWrapper} passGuidance={passGuidanceWrapper} />
                  </View>
                </View>
                {/* Right column */}
                <View style={styles.columnContainer}>
                  <View style={styles.columnContainer}>
                  {inferredImage && <Image source={imageSource} style={styles.imageStyle} />}
                    <Text style={styles.promptText}>{returnedPrompt}</Text>
                  </View>
                </View>
             
          </View>) : 
          (<View style={styles.columnContainer}>
            <PromptInputComponent passPrompt={passPromptWrapper} />
                <DropDownComponent passModelID={passModelIDWrapper} />
                {activity ?
                  <ActivityIndicator size="large" color="#B58392"/> :
                  <Pressable
                    onPress={() => { setParameters(`${prompt}-${steps}-${guidance}-${modelID}`); } }
                    style={({ pressed }) => [{ backgroundColor: pressed ? '#9DA58D' : '#958DA5', }, styles.button]}>
                    {({ pressed }) => (<Text style={styles.promptText}>{pressed ? 'INFERRED!' : 'Inference'}</Text>)}
                  </Pressable>}
                  {modelError ? <Text style={styles.promptText}>Model Error!</Text>:<></>}
                <SliderComponent passSteps={passStepsWrapper} passGuidance={passGuidanceWrapper} />   
                {inferredImage && <Image source={imageSource} style={styles.imageStyle} />}
                <Text style={styles.promptText}>{returnedPrompt}</Text>
            </View>)}
        </ScrollView><StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  
  titlecontainer: {
    backgroundColor: '#25292e',
    position: 'absolute', 
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,  
    padding: 20
  },
  rowContainer: {
    flex: 1,
    backgroundColor: '#25292e',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    overflow: 'auto',
    padding: 20
  },
  columnContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    
  },
  button:{
    fontFamily: 'Sigmar',
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3
  },
  activityIndicator:{
    marginLeft: 50
  },
  promptText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Sigmar',
    letterSpacing: 2,
    lineHeight: 30
  },
  ScrollView: {
    backgroundColor: '#25292e',
    marginTop: 50,
    padding: 5
  },
  imageStyle: {
    width: 320,
    height: 440,
    borderRadius: 18,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center'
  }
});

registerRootComponent(App);