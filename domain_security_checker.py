import requests
from bs4 import BeautifulSoup
import json
import schedule
import time
from datetime import datetime
import logging
import os

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('domain_checker.log'),
        logging.StreamHandler()
    ]
)

def check_google_transparency(domain):
    url = f"https://transparencyreport.google.com/safe-browsing/search?url={domain}"
    try:
        response = requests.get(url, timeout=10)
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
    try:
        response = requests.get(url, timeout=10)
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