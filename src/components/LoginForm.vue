<template>
  <v-card class="pa-4 ma-4" elevation="2" width="400">
    <v-card-title>Login</v-card-title>
    <v-form @submit.prevent="handleLogin" :disabled="loading">
      <v-text-field
        v-model="username"
        label="Username"
        required
        density="comfortable"
        :rules="[v => !!v || 'Username is required']"
      />
      <v-text-field
        v-model="password"
        label="Password"
        type="password"
        required
        density="comfortable"
        :rules="[v => !!v || 'Password is required']"
      />
      <v-btn type="submit" color="primary" :loading="loading" block>
        Login
      </v-btn>
      <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { loginUser } from '../auth/login.js'
import { isLoggedIn } from '../auth/authState.js'


// Emits the JWT token on success
const emit = defineEmits(['authenticated'])

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

watch([username, password], () => {
  if (error.value) error.value = ''
})

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const trimmedUsername = username.value.trim()
    const trimmedPassword = password.value

    const { accessToken, idToken, refreshToken } = await loginUser(trimmedUsername, trimmedPassword)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('idToken', idToken)
    localStorage.setItem('refreshToken', refreshToken)
    isLoggedIn.value = true
    const payload = JSON.parse(atob(idToken.split('.')[1]))
    console.log('idToken payload:', payload)
    console.log('idToken:', idToken)
    emit('authenticated', { accessToken, idToken, refreshToken })

  } catch (err) {
    error.value = 'Login failed. Please check your credentials.'
    console.error('Login error:', err)
    router.push('/') // or login route
  } finally {
    loading.value = false
  }
}
</script>
