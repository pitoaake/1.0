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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 页面标题 */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">域名安全检测系统</h1>
            <p className="mt-2 text-sm text-gray-600">实时监控域名安全状态，保护您的网站安全</p>
          </div>

          {/* 连接状态显示 */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              检测服务状态
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Google 安全检测
                </h3>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    connectionStatus.google === '正常' ? 'bg-green-500' : 
                    connectionStatus.google === '检查中...' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-sm text-gray-600">{connectionStatus.google}</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Spamhaus 检测
                </h3>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    connectionStatus.spamhaus === '正常' ? 'bg-green-500' : 
                    connectionStatus.spamhaus === '检查中...' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-sm text-gray-600">{connectionStatus.spamhaus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 添加域名表单 */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              添加新域名
            </h2>
            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                  域名
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="domain"
                    id="domain"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="example.com"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        添加中...
                      </>
                    ) : '添加'}
                  </button>
                </div>
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-100 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {success}
                </div>
              )}
            </form>
          </div>

          {/* 域名状态表格 */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    域名安全状态
                  </h2>
                  {lastUpdate && (
                    <p className="text-sm text-gray-500 mt-1">
                      最后更新: {lastUpdate}
                    </p>
                  )}
                </div>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      刷新中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      刷新
                    </>
                  )}
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : domains.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">暂无域名数据</h3>
                  <p className="mt-1 text-sm text-gray-500">请添加域名开始检测</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">域名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Google 状态</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spamhaus 状态</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检测时间</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {domains.map(([domain, data]) => (
                        <tr key={domain} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{domain}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusColor(data.google_status)}`}>
                              {data.google_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusColor(data.spamhaus_status)}`}>
                              {data.spamhaus_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.timestamp}</td>
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