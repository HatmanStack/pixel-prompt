import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const data = [
  { label: 'Stable Diffusion', value: 'stabilityai/stable-diffusion-xl-base-1.0' },
  { label: 'Open Journey', value: 'prompthero/openjourney' },
  { label: 'Photo', value: 'dreamlike-art/dreamlike-photoreal-2.0' },
  { label: 'Arcane', value: 'nitrosocke/Arcane-Diffusion' },
  { label: 'Van-Gogh', value: 'dallinmackay/Van-Gogh-diffusion' },
  { label: 'Robots', value: 'nousr/robo-diffusion' }
];

export default function DropDownComponent({passModelID}){

  return (
    <Dropdown
      style={styles.dropdown}
      selectedTextStyle={styles.selectedTextStyle}
      placeholderStyle={styles.placeholderStyle}
      data={data}
      labelField="label"
      valueField="value"
      placeholder="Model ID"
      onChange={item => {
        passModelID(item.value);
      }}
      
    />
  );
}

const colors = {
  borderBottomColor: '#9DA58D',
  color: '#FFFFFF',
};
const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    width: 300,
    borderBottomColor: colors.borderBottomColor,
    borderBottomWidth: 3,
  },
  placeholderStyle: {
    color: colors.color,
    fontSize: 25,
    textAlign: 'center',
    letterSpacing: 3,
  },
  selectedTextStyle: {
    color: colors.color,
    fontSize: 20,
    letterSpacing: 3,
    textAlign: 'center',
  },
});