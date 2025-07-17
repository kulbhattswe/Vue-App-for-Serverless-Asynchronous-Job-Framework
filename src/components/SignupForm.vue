<template>
  <v-form @submit.prevent="submitSignup">
    <v-text-field v-model="username" label="Username" required />
    <v-text-field v-model="fullName" label="Full Name" required />
    <v-text-field v-model="email" label="Email" type="email" required />
    <v-text-field v-model="password" label="Password" type="password" required />
    
    <v-btn type="submit" color="primary">Sign Up</v-btn>

    <div v-if="signupSuccess">
      <v-text-field v-model="confirmationCode" label="Confirmation Code" />
      <v-btn @click="submitConfirmation" color="success">Confirm Account</v-btn>
    </div>
    
    <div v-if="error" class="mt-4 red--text">{{ error }}</div>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import { signUpUser, confirmUser } from '../auth/signup.js'
import { loginUser } from '../auth/login.js'

const username = ref('')
const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmationCode = ref('')
const error = ref('')
const signupSuccess = ref(false)

const submitSignup = async () => {
  error.value = ''
  try {
    await signUpUser(username.value, password.value, email.value, fullName.value)
    signupSuccess.value = true
  } catch (err) {
    error.value = err.message || 'Signup failed'
  }
}

const submitConfirmation = async () => {
  try {
    await confirmUser(username.value, confirmationCode.value)

    //  Log in immediately after confirmation
    const tokens = await loginUser(username.value, password.value)
    
    localStorage.setItem('idToken', tokens.idToken)

    alert('User confirmed successfully! You can now log in.')
    signupSuccess.value = false
  } catch (err) {
    error.value = err.message || 'Confirmation failed'
  }
}
</script>
