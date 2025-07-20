<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="auto">
        <v-card class="pa-4 ma-4" elevation="2" width="420">
            <v-card-title class="text-h6">
            {{ isLogin ? 'Login' : 'Sign Up' }}
          </v-card-title>

          <component
            :is="isLogin ? LoginForm : SignupForm"
            :key="isLogin ? 'login' : 'signup'"
            @authenticated="$emit('authenticated', $event)"
          />


          <div class="text-center mt-4">
            <v-btn variant="text" @click="isLogin = !isLogin">
              {{ isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in" }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import SignupForm from './SignupForm.vue'


const isLogin = ref(true)
</script>
