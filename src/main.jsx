import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import theme from './theme'
import { ConfirmProvider } from "material-ui-confirm"
import { GoogleOAuthProvider } from '@react-oauth/google';
import "../src/index.scss";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <CssVarsProvider theme = {theme}>
    <ConfirmProvider defaultOptions={{
       allowClose: false,
       confirmationButtonProps:{color: 'secondary', variant:'outlined'},
       cancellationButtonProps:{color:'inherit'}
 
    }}>
      <ToastContainer position='bottom-left' theme='colored'/>
    <CssBaseline />
    <GoogleOAuthProvider clientId="1069870442988-lr05e97vgnujc2318lmi39gh4pc1v6vb.apps.googleusercontent.com">
    <App />
    </GoogleOAuthProvider>
    </ConfirmProvider>
    </CssVarsProvider>
  // </React.StrictMode>,
)
