import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from './services/api';

const App = () => {
  const [baseUrl, setBaseUrl] = useState('http://192.168.100.149:8000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testHealth = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Update API base URL
      api.defaults.baseURL = baseUrl;
      
      const response = await api.get('/health');
      setResult({
        status: '✅ Success',
        data: response.data,
        statusCode: response.status,
      });
    } catch (err) {
      setError({
        status: '❌ Failed',
        message: err.message,
        details: err.response?.data || 'No response from server',
        statusCode: err.response?.status || 'No status',
      });
      console.error('API Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      api.defaults.baseURL = baseUrl;
      
      const response = await api.post('/auth/register', {
        email: `test${Date.now()}@example.com`,
        password: 'test123456',
      });
      
      setResult({
        status: '✅ Registration Success',
        data: response.data,
        statusCode: response.status,
      });
    } catch (err) {
      setError({
        status: '❌ Registration Failed',
        message: err.message,
        details: err.response?.data?.detail || err.response?.data || 'No response from server',
        statusCode: err.response?.status || 'No status',
      });
      console.error('Auth Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      api.defaults.baseURL = baseUrl;
      
      const response = await api.post('/auth/login', {
        email: 'test@example.com',
        password: 'test123456',
      });
      
      setResult({
        status: '✅ Login Success',
        data: {
          access_token: response.data.access_token?.substring(0, 30) + '...',
          refresh_token: response.data.refresh_token?.substring(0, 30) + '...',
        },
        statusCode: response.status,
      });
    } catch (err) {
      setError({
        status: '❌ Login Failed',
        message: err.message,
        details: err.response?.data?.detail || err.response?.data || 'No response from server',
        statusCode: err.response?.status || 'No status',
      });
      console.error('Login Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🔌 API Connection Test</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Base URL:</Text>
        <TextInput
          style={styles.input}
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder="http://localhost:8000"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.healthButton]} onPress={testHealth} disabled={loading}>
          <Text style={styles.buttonText}>🏥 Health</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.authButton]} onPress={testAuth} disabled={loading}>
          <Text style={styles.buttonText}>📝 Register</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={testLogin} disabled={loading}>
          <Text style={styles.buttonText}>🔑 Login</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Testing connection...</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Result:</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultStatus}>{result.status}</Text>
            <Text style={styles.resultText}>Status Code: {result.statusCode}</Text>
            <Text style={styles.resultText}>Data:</Text>
            <View style={styles.jsonBox}>
              <Text style={styles.jsonText}>
                {JSON.stringify(result.data, null, 2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error:</Text>
          <View style={styles.errorBox}>
            <Text style={styles.errorStatus}>{error.status}</Text>
            <Text style={styles.errorText}>Status Code: {error.statusCode}</Text>
            <Text style={styles.errorText}>Message: {error.message}</Text>
            {error.details && (
              <>
                <Text style={styles.errorText}>Details:</Text>
                <View style={styles.jsonBox}>
                  <Text style={styles.jsonText}>
                    {typeof error.details === 'object' 
                      ? JSON.stringify(error.details, null, 2)
                      : error.details}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f7fafc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  healthButton: {
    backgroundColor: '#48bb78',
  },
  authButton: {
    backgroundColor: '#4299e1',
  },
  loginButton: {
    backgroundColor: '#667eea',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    marginTop: 10,
    color: '#4a5568',
    fontSize: 14,
  },
  resultContainer: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 8,
  },
  resultBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#48bb78',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48bb78',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 4,
  },
  errorContainer: {
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 8,
  },
  errorBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#fc8181',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fc8181',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 4,
  },
  jsonBox: {
    backgroundColor: '#f7fafc',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  jsonText: {
    fontSize: 12,
    color: '#2d3748',
    fontFamily: 'monospace',
  },
});

export default App;