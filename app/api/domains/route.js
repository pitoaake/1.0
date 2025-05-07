import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const domainsPath = path.join(process.cwd(), 'domains.json')
const resultsPath = path.join(process.cwd(), 'security_results.json')

// 获取域名列表
export async function GET() {
  try {
    const fileContents = fs.readFileSync(domainsPath, 'utf8')
    return NextResponse.json(JSON.parse(fileContents))
  } catch (error) {
    console.error('Error reading domains:', error)
    return NextResponse.json({ domains: [] })
  }
}

// 添加新域名
export async function POST(request) {
  try {
    const { domain } = await request.json()
    
    // 验证域名格式
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: '无效的域名格式' }, { status: 400 })
    }

    // 读取现有域名
    let domains = { domains: [] }
    try {
      const fileContents = fs.readFileSync(domainsPath, 'utf8')
      domains = JSON.parse(fileContents)
    } catch (error) {
      // 如果文件不存在，创建新文件
      fs.writeFileSync(domainsPath, JSON.stringify(domains, null, 2))
    }

    // 检查域名是否已存在
    if (domains.domains.includes(domain)) {
      return NextResponse.json({ error: '域名已存在' }, { status: 400 })
    }

    // 添加新域名
    domains.domains.push(domain)
    fs.writeFileSync(domainsPath, JSON.stringify(domains, null, 2))

    // 更新检测结果
    let results = {}
    try {
      const resultsContent = fs.readFileSync(resultsPath, 'utf8')
      results = JSON.parse(resultsContent)
    } catch (error) {
      // 如果文件不存在，创建新文件
    }

    // 添加新域名的初始状态
    results[domain] = {
      google_status: '紫色',
      spamhaus_status: '紫色',
      timestamp: new Date().toISOString()
    }
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2))

    return NextResponse.json({ success: true, domain })
  } catch (error) {
    console.error('Error adding domain:', error)
    return NextResponse.json({ error: '添加域名失败' }, { status: 500 })
  }
} 