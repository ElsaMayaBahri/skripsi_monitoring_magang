#!/usr/bin/env node
/**
 * Test API connections dari frontend ke backend
 * Run: node test_api.js
 */

const axios = require('axios')

const API_URL = 'http://localhost:8000/api'

const testAPI = async () => {
  console.log('\n========================================')
  console.log('   TESTING FRONTEND-BACKEND CONNECTION')
  console.log('========================================\n')

  const testResults = {
    login: null,
    peserta: null,
    mentors: null,
    divisi: null,
  }

  try {
    // Test login first
    console.log('1️⃣  Testing LOGIN endpoint...')
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: 'admin@gmail.com',
      password: 'password',
    })

    const token = loginRes.data.token
    console.log('   ✅ Login success')
    console.log(`   📝 Token: ${token?.substring(0, 30)}...`)
    testResults.login = { success: true, token }

    // Create axios instance with token
    const axiosWithAuth = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    // Test peserta endpoint
    console.log('\n2️⃣  Testing GET /peserta endpoint...')
    const pesertaRes = await axiosWithAuth.get('/peserta')
    const pesertaCount = Array.isArray(pesertaRes.data) ? pesertaRes.data.length : 0
    console.log(`   ✅ GET /peserta success (${pesertaCount} records)`)
    testResults.peserta = { success: true, count: pesertaCount, sample: pesertaRes.data?.[0] }

    // Test mentors endpoint
    console.log('\n3️⃣  Testing GET /mentors endpoint...')
    const mentorsRes = await axiosWithAuth.get('/mentors')
    const mentorsCount = Array.isArray(mentorsRes.data) ? mentorsRes.data.length : 0
    console.log(`   ✅ GET /mentors success (${mentorsCount} records)`)
    testResults.mentors = { success: true, count: mentorsCount, sample: mentorsRes.data?.[0] }

    // Test divisi endpoint
    console.log('\n4️⃣  Testing GET /divisi endpoint...')
    const divisiRes = await axiosWithAuth.get('/divisi')
    const divisiCount = Array.isArray(divisiRes.data) ? divisiRes.data.length : 0
    console.log(`   ✅ GET /divisi success (${divisiCount} records)`)
    testResults.divisi = { success: true, count: divisiCount, sample: divisiRes.data?.[0] }

    // Summary
    console.log('\n========================================')
    console.log('   ✅ ALL TESTS PASSED!')
    console.log('========================================')
    console.log('\n📊 Summary:')
    console.log(`   • Login: ✅`)
    console.log(`   • Peserta: ✅ (${pesertaCount} records)`)
    console.log(`   • Mentors: ✅ (${mentorsCount} records)`)
    console.log(`   • Divisi: ✅ (${divisiCount} records)`)
    console.log('\n✨ Frontend-Backend connection is working properly!\n')

  } catch (error) {
    console.error('\n❌ ERROR:')
    if (error.response) {
      console.error(`   Status: ${error.response.status}`)
      console.error(`   Message: ${error.response.data?.message || error.message}`)
    } else {
      console.error(`   ${error.message}`)
    }
    console.log('\n⚠️  Make sure backend is running on http://localhost:8000\n')
  }

  return testResults
}

testAPI()
