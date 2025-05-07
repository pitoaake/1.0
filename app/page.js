'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [newDomain, setNewDomain] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastUpdate, setLastUpdate] = useState('')
  const [connectionStatus, setConnectionStatus] = useState({
    google: '检查中...',
    spamhaus: '检查中...'
  })

  const checkConnectionStatus = async () => {
    try {
      const response = await axios.get('/api/connection-status')
      setConnectionStatus(response.data)
    } catch (error) {
      console.error('检查连接状态失败:', error)
      setConnectionStatus({
        google: '检查失败',
        spamhaus: '检查失败'
      })
    }
  }

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/security-results')
      setDomains(Object.entries(response.data))
      setLastUpdate(new Date().toLocaleTimeString())
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('获取数据失败，请稍后重试')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    checkConnectionStatus()
    // 每30秒自动刷新一次
    const interval = setInterval(() => {
      fetchData()
      checkConnectionStatus()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleAddDomain = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const response = await axios.post('/api/domains', { domain: newDomain })
      setSuccess('域名添加成功，正在检测...')
      setNewDomain('')
      
      // 立即刷新数据
      await fetchData()
      
      // 5秒后再次刷新，确保检测结果已更新
      setTimeout(fetchData, 5000)
    } catch (error) {
      setError(error.response?.data?.error || '添加域名失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case '绿色':
        return 'bg-status-green'
      case '红色':
        return 'bg-status-red'
      case '黄色':
        return 'bg-status-yellow'
      case '紫色':
        return 'bg-status-purple'
      default:
        return 'bg-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 页面标题 */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">域名安全检测</h1>
          </div>

          {/* 连接状态显示 */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Google 安全检测</h3>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    connectionStatus.google === '正常' ? 'bg-green-500' : 
                    connectionStatus.google === '检查中...' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-sm text-gray-600">{connectionStatus.google}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Spamhaus 检测</h3>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    connectionStatus.spamhaus === '正常' ? 'bg-green-500' : 
                    connectionStatus.spamhaus === '检查中...' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-sm text-gray-600">{connectionStatus.spamhaus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 添加域名表单 */}
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-base font-medium text-gray-900 mb-4">添加新域名</h2>
            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="domain"
                    id="domain"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="example.com"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '添加中...' : '添加'}
                  </button>
                </div>
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-100">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-600 text-sm bg-green-50 p-2 rounded border border-green-100">
                  {success}
                </div>
              )}
            </form>
          </div>

          {/* 域名状态表格 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-medium text-gray-900">域名安全状态</h2>
                  {lastUpdate && (
                    <p className="text-xs text-gray-500 mt-1">
                      最后更新: {lastUpdate}
                    </p>
                  )}
                </div>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? '刷新中...' : '刷新'}
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : domains.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无域名数据，请添加域名
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">域名</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Google 状态</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spamhaus 状态</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检测时间</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {domains.map(([domain, data]) => (
                        <tr key={domain} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{domain}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusColor(data.google_status)}`}>
                              {data.google_status}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusColor(data.spamhaus_status)}`}>
                              {data.spamhaus_status}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{data.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 