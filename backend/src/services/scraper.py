import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def crawl_site(start_url, max_pages, log_callback=None):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    visited = set()
    to_visit = [start_url]
    all_text = ""

    domain = urlparse(start_url).netloc

    while to_visit and len(visited) < max_pages:
        url = to_visit.pop(0)
        if url in visited:
            continue

        visited.add(url)
        if log_callback:
            log_callback(f"Scraping: {url}")

        try:
            driver.get(url)
            time.sleep(2)

            soup = BeautifulSoup(driver.page_source, "html.parser")
            text = soup.get_text(separator="\n", strip=True)
            all_text += "\n" + text

            for a in soup.find_all("a", href=True):
                link = urljoin(url, a["href"])
                if urlparse(link).netloc == domain:
                    to_visit.append(link)

        except Exception as e:
            if log_callback:
                log_callback(f"Error: {e}")

    driver.quit()
    return all_text
