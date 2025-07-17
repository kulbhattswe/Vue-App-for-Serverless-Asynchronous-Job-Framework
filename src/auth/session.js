// src/auth/session.js
import { CognitoUserPool } from 'amazon-cognito-identity-js'
import { cognitoConfig } from '../config.js'

const poolData = {
  UserPoolId: cognitoConfig.userPoolId,        // Replace with your pool ID
  ClientId: cognitoConfig.clientId    // Replace with your app client ID
}

const userPool = new CognitoUserPool(poolData)

export function getCurrentSession() {
  const cognitoUser = userPool.getCurrentUser()

  return new Promise((resolve, reject) => {
    if (!cognitoUser) return reject('No user')

    cognitoUser.getSession((err, session) => {
      if (err || !session.isValid()) return reject(err)
      resolve({ user: cognitoUser, session })
    })
  })
}
