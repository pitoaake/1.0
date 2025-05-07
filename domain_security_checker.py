import requests
from bs4 import BeautifulSoup
import json
import schedule
import time
from datetime import datetime
import logging
import os
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('domain_checker.log'),
        logging.StreamHandler()
    ]
)

# 配置请求会话
def create_session():
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

# 通用请求头
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

def check_google_transparency(domain):
    url = f"https://transparencyreport.google.com/safe-browsing/search?url={domain}"
    session = create_session()
    try:
        response = session.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            if "No unsafe content found" in soup.text:
                return "绿色"
            elif "Unsafe content found" in soup.text:
                return "红色"
            else:
                return "黄色"
        else:
            logging.warning(f"Google 检测失败: {domain}, 状态码: {response.status_code}")
            return "紫色"
    except Exception as e:
        logging.error(f"Google 检测异常: {domain}, 错误: {str(e)}")
        return "紫色"

def check_spamhaus(domain):
    url = f"https://check.spamhaus.org/listed/?domain={domain}"
    session = create_session()
    try:
        response = session.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            if "is not listed" in response.text:
                return "绿色"
            else:
                return "红色"
        else:
            logging.warning(f"Spamhaus 检测失败: {domain}, 状态码: {response.status_code}")
            return "紫色"
    except Exception as e:
        logging.error(f"Spamhaus 检测异常: {domain}, 错误: {str(e)}")
        return "紫色"

def check_domains():
    try:
        # 读取域名列表
        with open('domains.json', 'r', encoding='utf-8') as f:
            domains = json.load(f)['domains']
        
        # 读取现有结果
        results = {}
        try:
            with open('security_results.json', 'r', encoding='utf-8') as f:
                results = json.load(f)
        except FileNotFoundError:
            pass

        # 检查每个域名
        for domain in domains:
            logging.info(f"开始检查域名: {domain}")
            google_status = check_google_transparency(domain)
            time.sleep(2)  # 添加延迟，避免请求过快
            spamhaus_status = check_spamhaus(domain)
            
            results[domain] = {
                'google_status': google_status,
                'spamhaus_status': spamhaus_status,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            logging.info(f"域名 {domain} 检查完成: Google={google_status}, Spamhaus={spamhaus_status}")

        # 保存结果
        with open('security_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=4, ensure_ascii=False)
        
        logging.info("所有域名检查完成")
    except Exception as e:
        logging.error(f"检查过程发生错误: {str(e)}")

def main():
    logging.info("域名安全检测服务启动")
    schedule.every(15).minutes.do(check_domains)
    
    # 立即执行一次检查
    check_domains()
    
    while True:
        try:
            schedule.run_pending()
            time.sleep(1)
        except Exception as e:
            logging.error(f"调度器错误: {str(e)}")
            time.sleep(60)  # 发生错误时等待一分钟再继续

if __name__ == "__main__":
    main() 