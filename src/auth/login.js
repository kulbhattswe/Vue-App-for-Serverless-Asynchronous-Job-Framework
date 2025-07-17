import {
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js'
import { userPool } from './cognito.js'

export function loginUser(username, password) {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    })

    const userData = {
      Username: username,
      Pool: userPool,
    }

    const cognitoUser = new CognitoUser(userData)

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const accessToken = result.getAccessToken().getJwtToken()
        const idToken = result.getIdToken().getJwtToken()
        const refreshToken = result.getRefreshToken().getToken()
        console.log('Access token:', accessToken)
        resolve({ accessToken, idToken, refreshToken })
      },
      onFailure: (err) => {
        reject(err)
      },
        newPasswordRequired: function(userAttributes, requiredAttributes) {
          // This gets triggered for users with temporary passwords

          // Strip out attributes that Cognito doesn't accept on submission
          delete userAttributes.email_verified;
          delete userAttributes.phone_number_verified;

          // Prompt user for new password (e.g., via modal/input)
          const newPassword = prompt("Enter new password:");

          cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
        }
    })
  })
}
