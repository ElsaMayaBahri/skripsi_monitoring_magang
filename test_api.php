<?php
/**
 * Test Frontend-Backend API Connection
 */

echo "\n========================================\n";
echo "   TESTING FRONTEND-BACKEND CONNECTION\n";
echo "========================================\n\n";

$baseURL = 'http://localhost:8000/api';
$results = [];

try {
    // 1. Test Login
    echo "1️⃣  Testing LOGIN endpoint...\n";
    $ch = curl_init($baseURL . '/login');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'email' => 'admin@gmail.com',
        'password' => 'password'
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($statusCode === 200) {
        $data = json_decode($response, true);
        $token = $data['token'] ?? null;
        echo "   ✅ Login success\n";
        echo "   📝 Token: " . substr($token, 0, 30) . "...\n\n";
        $results['login'] = ['success' => true, 'token' => $token];
    } else {
        throw new Exception("Login failed with status $statusCode");
    }
    
    // 2. Test GET /peserta
    echo "2️⃣  Testing GET /peserta endpoint...\n";
    $ch = curl_init($baseURL . '/peserta');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($statusCode === 200) {
        $data = json_decode($response, true);
        $count = is_array($data) ? count($data) : 0;
        echo "   ✅ GET /peserta success ($count records)\n";
        $results['peserta'] = ['success' => true, 'count' => $count];
    } else {
        throw new Exception("GET /peserta failed with status $statusCode");
    }
    
    // 3. Test GET /mentors
    echo "3️⃣  Testing GET /mentors endpoint...\n";
    $ch = curl_init($baseURL . '/mentors');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($statusCode === 200) {
        $data = json_decode($response, true);
        $count = is_array($data) ? count($data) : 0;
        echo "   ✅ GET /mentors success ($count records)\n";
        $results['mentors'] = ['success' => true, 'count' => $count];
    } else {
        throw new Exception("GET /mentors failed with status $statusCode");
    }
    
    // 4. Test GET /divisi
    echo "4️⃣  Testing GET /divisi endpoint...\n";
    $ch = curl_init($baseURL . '/divisi');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($statusCode === 200) {
        $data = json_decode($response, true);
        $count = is_array($data) ? count($data) : 0;
        echo "   ✅ GET /divisi success ($count records)\n";
        $results['divisi'] = ['success' => true, 'count' => $count];
    } else {
        throw new Exception("GET /divisi failed with status $statusCode");
    }
    
    // Summary
    echo "\n========================================\n";
    echo "   ✅ ALL TESTS PASSED!\n";
    echo "========================================\n\n";
    echo "📊 Summary:\n";
    echo "   • Login: ✅\n";
    echo "   • Peserta: ✅ (" . $results['peserta']['count'] . " records)\n";
    echo "   • Mentors: ✅ (" . $results['mentors']['count'] . " records)\n";
    echo "   • Divisi: ✅ (" . $results['divisi']['count'] . " records)\n";
    echo "\n✨ Frontend-Backend connection is working properly!\n\n";
    
} catch (Exception $e) {
    echo "\n❌ ERROR:\n";
    echo "   " . $e->getMessage() . "\n\n";
    echo "⚠️  Make sure backend is running on http://localhost:8000\n\n";
}
