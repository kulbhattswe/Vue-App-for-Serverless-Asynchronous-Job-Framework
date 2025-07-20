<template>
  <v-container fluid>
        <!-- Show nothing while checking session -->
        <div v-if="isLoading">Loading...</div>

        <!-- Show login/signup if not logged in -->
        <auth-form v-else-if="!isLoggedIn" />

        <!-- Show main app if logged in -->
        <template v-else>
          <v-row justify="end" class="mb-4">
            <v-btn color="secondary" @click="handleLogout">Logout</v-btn>
          </v-row>
          <v-textarea
            label="Enter Content 1"
            v-model="fileContent1"
            auto-grow
            rows="4"
            class="mb-4"
          />
          <v-textarea
            label="Enter Content 2"
            v-model="fileContent2"
            auto-grow
            rows="4"
            class="mb-4"
          />

          
          <v-btn
            color="primary"
            class="ma-4"
            :loading="loading"
            :disabled="!canSubmit || loading"
            @click="handleSubmit"
          >
            Submit
          </v-btn>
          <result :text="resultText" />
          
          <!-- File download button -->
          <div v-if="resultText && downloadUrl" class="mt-4">
            <v-btn
              color="success"
              :href="downloadUrl"
              target="_blank"
              rel="noopener"
              download
            >
              📄 Download S3 Job document
            </v-btn>
          </div>
          <!-- Job Table Section -->
          <div class="mt-8">
            <v-btn color="info" @click="fetchJobs" :loading="jobsLoading">
              🔄 Load All Jobs
            </v-btn>

            <div style="overflow-x: auto; max-width: 100%;">
              <v-data-table
                :headers="jobHeaders"
                :items="jobsFormatted"
                :items-per-page="5"
                style="table-layout: fixed;"
                density="compact"
                item-value="job_id"
                class="mt-4"
                :footer-props="{
                  itemsPerPageOptions: [5, 10, 20],
                  showFirstLastPage: true,
                  showCurrentPage: true
                }"
              >
                <!-- Toolbar -->
                <template #top>
                  <v-toolbar flat>
                    <v-toolbar-title>All Jobs</v-toolbar-title>
                    <v-spacer />
                    <v-btn color="info" @click="fetchJobs" :loading="jobsLoading">
                      🔄 Load All Jobs
                    </v-btn>
                  </v-toolbar>
                </template>

                <!-- Truncate job_id column -->
                <template #item.job_id="{ item }">
                  <div style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ item.job_id }}
                  </div>
                </template>
              </v-data-table>
            </div>


            <div v-if="jobs" class="mt-2 text-caption text-right">
              Loaded {{ jobsFormatted.length }} job(s)
            </div>


          </div>

        </template>
        
      </v-container>
</template>

<script setup>
import { isLoggedIn, isLoading } from '../auth/authState'
import { ref, computed, onMounted } from 'vue'
import AuthForm from '../components/AuthForm.vue'
import Result from '../components/Result.vue'
import axios from 'axios'
import { apiUrl} from '../config.js'
import { getCurrentSession } from '../auth/session.js'
import { logoutUser } from '../auth/logout.js'
import { userPool } from '../auth/cognito' 
import { CognitoUser } from 'amazon-cognito-identity-js'

const isAuthenticated = ref(false)
const token = ref('')
const fileContent1 = ref('')
const fileContent2 = ref('')
const resultText = ref('')
const downloadUrl = ref('')
const loading = ref(false)

axios.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { session } = await getCurrentSession()
        const newToken = session.getAccessToken().getJwtToken()
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`

        // ALSO: update token in Cognito session store
        token.value = newToken
        const cognitoUser = userPool.getCurrentUser()
        if (cognitoUser) {
          cognitoUser.setSignInUserSession(session)
        }
        token.value = newToken
        localStorage.setItem('accessToken', newToken)
        return axios(originalRequest)
      } catch (refreshErr) {
        console.error('Token refresh failed:', refreshErr)
        // maybe trigger logout
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(err)
  }
)

onMounted(async () => {
  try {
    const { session } = await getCurrentSession()
    const token = session.getAccessToken().getJwtToken()
    //const token = session.getIdTokenToken().getJwtToken()
    console.log('Current session:', session)
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    isLoggedIn.value = true
     console.log('User auto-logged in with token:', token)

    // Optionally store user info like email
    const idToken = session.getIdToken().getJwtToken()
    const payload = JSON.parse(atob(idToken.split('.')[1]))
    console.log('User email:', payload.email)
  } catch (err) {
    isLoggedIn.value = false
  } finally {
    isLoading.value = false
  }
})

const canSubmit = computed(() => {
  return fileContent1.value && fileContent2.value
})

const handleSubmit = async () => {
  loading.value = true
  resultText.value = ''
  try {
    const accessToken = token.value || localStorage.getItem('accessToken')

    // Step 1: Start the task
    console.log('calling API at:', apiUrl)
    const startResponse = await axios.post(`${apiUrl}/job`, {
      name: 'combine_fields',
      description: 'Combine two text fields',
      action: 'combine',
      context1: fileContent1.value,
      context2: fileContent2.value
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    const jobId = startResponse.data.job_id
    if (!jobId) throw new Error('No jobId returned from server')
    console.log('Job started with ID:', jobId)

    // Step 2: Poll for status
    const pollInterval = 6000 // 6 seconds
    const maxAttempts = 20
    let attempts = 0

    const poll = async () => {
      try {
        const statusResponse = await axios.get(`${apiUrl}/job?job_id=${jobId}`)

        const { status, job_id, createdAt, action, name, presigned_url} = statusResponse.data

        console.log('statusResponse:', statusResponse.data) 
        if (status !== 'PENDING') {
          resultText.value = `Your job:${job_id} has completed processing with status ${status}` || 'No result'
          downloadUrl.value = presigned_url || ''
          loading.value = false
        } else if (status === 'error') {
          resultText.value = error || 'An error occurred while processing'
          loading.value = false
        } else {
          // Still pending — continue polling
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, pollInterval)
          } else {
            resultText.value = 'Timed out waiting for result'
            loading.value = false
          }
        }
      } catch (err) {
        console.error('Polling failed:', err)
        resultText.value = 'Error while polling job status'
        loading.value = false
      }
    }

    poll()
  } catch (err) {
    resultText.value = 'Error starting task'
    console.error(err)
    loading.value = false
  }
}

const onAuthenticated = (t) => {
  token.value = t
  isAuthenticated.value = true
}

function handleLogout() {
  logoutUser()
  delete axios.defaults.headers.common['Authorization']
  isLoggedIn.value = false
}

const jobs = ref([])
const jobsLoading = ref(false)

const fetchJobs = async () => {
  jobsLoading.value = true
  try {
    const accessToken = token.value || localStorage.getItem('accessToken')
    const response = await axios.get(`${apiUrl}/jobs`)
    jobs.value = response.data.jobs || []
  } catch (err) {
    console.error('Failed to fetch jobs:', err)
  } finally {
    jobsLoading.value = false
  }
}

const jobHeaders = [
  { title: 'Job ID', key: 'job_id' },
  { title: 'Name', key: 'name' },
  { title: 'Action', key: 'action' },
  { title: 'Status', key: 'status' },
  { title: 'Created At', key: 'createdAt' }
]

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const jobsFormatted = computed(() =>
  jobs.value.map(job => ({
    ...job,
    createdAt: formatDate(job.createdAt),
  }))
)

</script>
