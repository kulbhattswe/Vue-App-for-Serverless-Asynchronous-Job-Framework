<template>
  <v-card class="pa-4 ma-4" elevation="2" width="420">
    <v-card-title class="text-h6">
      {{ isLogin ? 'Login' : 'Sign Up' }}
    </v-card-title>

    <component
      :is="isLogin ? LoginForm : SignupForm"
      @authenticated="$emit('authenticated', $event)"
    />

    <div class="text-center mt-4">
      <v-btn variant="text" @click="isLogin = !isLogin">
        {{ isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in" }}
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import SignupForm from './SignupForm.vue'


const isLogin = ref(true)
</script>
