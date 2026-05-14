import axiosInstance from '../../utils/axiosConfig'

/**
 * Test API connections
 */
export const testAPIConnection = async () => {
  try {
    console.log('[TEST] Testing API connection...')
    
    // Test each endpoint
    const tests = {
      peserta: async () => axiosInstance.get('/peserta'),
      mentors: async () => axiosInstance.get('/mentors'),
      divisi: async () => axiosInstance.get('/divisi'),
    }
    
    const results = {}
    for (const [endpoint, testFn] of Object.entries(tests)) {
      try {
        const response = await testFn()
        results[endpoint] = {
          success: true,
          status: response.status,
          dataCount: Array.isArray(response.data) ? response.data.length : 'unknown',
          data: response.data
        }
        console.log(`✅ [${endpoint}] Success:`, results[endpoint])
      } catch (error) {
        results[endpoint] = {
          success: false,
          error: error.message,
          status: error.response?.status
        }
        console.error(`❌ [${endpoint}] Error:`, error.message)
      }
    }
    
    return results
  } catch (error) {
    console.error('[TEST] Connection test failed:', error)
    return { error: error.message }
  }
}
