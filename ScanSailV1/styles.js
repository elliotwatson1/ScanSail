import { StyleSheet } from 'react-native';

//file to include all different styles amongst the whole application

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1, 
  },
  loginButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: 10,
    backgroundColor: 'dodgerblue',
    borderRadius: 5,
    padding: 10,
  },
  loginText: {
    fontSize: 16,
    color: 'white',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    alignItems: 'center',
    bottom: 0,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
  },
  button: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 50,
    margin: 10,
  },
  inputContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    height: 40,
  },
  resultsHeading: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultItem: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    margin: 10,
  },
  webview: {
    flex: 1,
  },
  registerButton: {
    position: 'absolute',
    bottom: '30%',
    margin: 10,
    backgroundColor: 'dodgerblue',
    borderRadius: 10,
    padding: 10,
  },
  registerText: {
    fontSize: 16,
    color: 'white',
  },
  loginButton2: {
    position: 'absolute',
    bottom: '35%',
    margin: 10,
    backgroundColor: 'dodgerblue',
    borderRadius: 5,
    padding: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  createRaceButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  smallTextInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  resultsHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: 200,
  },
  highlightedRace:{
    backgroundColor: 'lightgrey'
  },
  selectedResult: {
    backgroundColor: '#e0e0e0',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
  },
  selectedResultsContainer: {
    marginTop: 20,
  },
  selectedResultItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  addRaceContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  raceNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
  },
  createRaceButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  createRaceButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  logoutButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    margin: 10,
    backgroundColor: 'dodgerblue',
    borderRadius: 5,
    padding: 10,
  },
  logoutText: {
    fontSize: 16,
    color: 'white',
  },
  dnfResult: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  dnsResult:{
    backgroundColor: 'rgba(0, 0, 255, 0.1)',
  },
  dell: {
    bottom: 20,
    position: 'absolute',
    alignSelf: 'center',
  },
  resetPasswordButton: {
    position: 'absolute',
    bottom: 270,
    margin: 10,
    backgroundColor: 'dodgerblue',
    borderRadius: 5,
    padding: 10,
  },
  forgotp: {
    position: 'absolute',
    bottom: 0,
    margin: 10,
    backgroundColor: 'dodgerblue',
    borderRadius: 5,
    padding: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'dodgerblue',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'dodgerblue',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
  },
  dnfButtonText: {
    fontSize: 16,
    color: 'white',
  },
  dnfButton: {
    margin: 10,
    backgroundColor: 'dodgerblue',
    borderRadius: 5,
    padding: 10,
    left: -10,
  },
  dnsButton:{
    margin: 10,
    backgroundColor: 'dodgerblue',
    borderRadius: 5,
    padding: 10,
    right: -10,
  },
  sButton: {
    margin: 10,
    backgroundColor: 'dodgerblue',
    borderRadius: 5,
    padding: 10,
  },
  loadcont: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'dodgerblue',
  },
  loadtext:{
    fontSize: 20,
    marginBottom: 20,
    color: 'white',
  }
});

export default styles;
