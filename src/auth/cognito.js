import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js'
import { cognitoConfig } from '../config.js'


const poolData = {
  UserPoolId: cognitoConfig.userPoolId,        // Replace with your pool ID
  ClientId: cognitoConfig.clientId    // Replace with your app client ID
}

const userPool = new CognitoUserPool(poolData)

export { userPool, CognitoUser, AuthenticationDetails }
