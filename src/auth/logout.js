import { CognitoUserPool } from 'amazon-cognito-identity-js'

import { cognitoConfig } from '../config.js'

const poolData = {
  UserPoolId: cognitoConfig.userPoolId,        // Replace with your pool ID
  ClientId: cognitoConfig.clientId    // Replace with your app client ID
}

const userPool = new CognitoUserPool(poolData)

export function logoutUser() {
  const user = userPool.getCurrentUser()
  if (user) {
    user.signOut()
    console.log('User signed out.')
  } else {
    console.log('No user to sign out.')
  }
}
