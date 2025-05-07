import { NextResponse } from 'next/server'
import requests from 'requests'

export async function GET() {
  try {
    // 检查 Google 连接
    const googleStatus = await checkGoogleConnection()
    
    // 检查 Spamhaus 连接
    const spamhausStatus = await checkSpamhausConnection()
    
    return NextResponse.json({
      google: googleStatus,
      spamhaus: spamhausStatus
    })
  } catch (error) {
    console.error('检查连接状态失败:', error)
    return NextResponse.json({
      google: '检查失败',
      spamhaus: '检查失败'
    })
  }
}

async function checkGoogleConnection() {
  try {
    const response = await fetch('https://transparencyreport.google.com/safe-browsing/search?url=example.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    })
    return response.ok ? '正常' : '异常'
  } catch (error) {
    console.error('Google 连接检查失败:', error)
    return '异常'
  }
}

async function checkSpamhausConnection() {
  try {
    const response = await fetch('https://check.spamhaus.org/listed/?domain=example.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    })
    return response.ok ? '正常' : '异常'
  } catch (error) {
    console.error('Spamhaus 连接检查失败:', error)
    return '异常'
  }
} 