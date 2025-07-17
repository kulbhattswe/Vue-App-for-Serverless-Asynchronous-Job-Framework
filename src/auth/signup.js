import {
  CognitoUserAttribute,
  CognitoUser,
} from 'amazon-cognito-identity-js'
import { userPool } from './cognito.js'

export function signUpUser(username, password, email, fullName) {
  return new Promise((resolve, reject) => {
    const attributeList = []

    if (email) {
      attributeList.push(
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        })
      )
    }

    if (fullName) {
      attributeList.push(
        new CognitoUserAttribute({
          Name: 'name',
          Value: fullName,
        })
      )
    }

    userPool.signUp(
      username,
      password,
      attributeList,
      null,
      (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result.user)
        }
      }
    )
  })
}

export function confirmUser(username, code) {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool,
    }

    const cognitoUser = new CognitoUser(userData)

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}
