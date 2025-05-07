import requests
from bs4 import BeautifulSoup
import json
import schedule
import time
from datetime import datetime

def check_google_transparency(domain):
    url = f"https://transparencyreport.google.com/safe-browsing/search?url={domain}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            if "No unsafe content found" in soup.text:
                return "绿色"
            elif "Unsafe content found" in soup.text:
                return "红色"
            else:
                return "黄色"
        else:
            return "紫色"
    except:
        return "紫色"

def check_spamhaus(domain):
    url = f"https://check.spamhaus.org/listed/?domain={domain}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            if "is not listed" in response.text:
                return "绿色"
            else:
                return "红色"
        else:
            return "紫色"
    except:
        return "紫色"

def check_domains():
    with open('domains.json', 'r') as f:
        domains = json.load(f)['domains']
    
    results = {}
    for domain in domains:
        google_status = check_google_transparency(domain)
        spamhaus_status = check_spamhaus(domain)
        results[domain] = {
            'google_status': google_status,
            'spamhaus_status': spamhaus_status,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    
    with open('security_results.json', 'w') as f:
        json.dump(results, f, indent=4)

def main():
    schedule.every(15).minutes.do(check_domains)
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main() 