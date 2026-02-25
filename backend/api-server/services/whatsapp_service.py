import pywhatkit
import datetime
import os
import urllib.parse
import time
import socket
import traceback
import sys
from dotenv import load_dotenv

# Load .env from parent directory (api-server/.env)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Ensure console supports UTF-8 for emojis
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

# Arguments: python whatsapp_service.py "phone" "message"
TARGET_PHONE = sys.argv[1] if len(sys.argv) > 1 else os.getenv("PHONE_NUMBER")
MESSAGE = sys.argv[2] if len(sys.argv) > 2 else "🚨 SafeVoice SOS: Testing alert system."

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.edge.service import Service
    from webdriver_manager.microsoft import EdgeChromiumDriverManager
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
except Exception:
    webdriver = None

_driver_path = None

def get_driver_path():
    global _driver_path
    if _driver_path is None:
        try:
            local_driver = os.path.join(os.getcwd(), "msedgedriver.exe")
            if os.path.exists(local_driver):
                _driver_path = local_driver
                return _driver_path
                
            print("📦 Syncing with EdgeDriver...")
            _driver_path = EdgeChromiumDriverManager().install()
        except Exception as e:
            print(f"❌ Driver sync failed: {e}")
    return _driver_path

def is_port_open(host, port):
    try:
        with socket.create_connection((host, port), timeout=2.0):
            return True
    except:
        return False

def send_whatsapp_fast(phone, message):
    if webdriver is None:
        print("❌ Selenium missing.")
        return False

    driver_path = get_driver_path()
    if not driver_path: 
        print("❌ Could not locate ChromeDriver.")
        return False

    profile_path = os.getenv("EDGE_PROFILE_PATH")
    options = webdriver.EdgeOptions()
    
    options.add_argument("--disable-infobars")
    options.add_argument("--window-size=1200,900")
    options.add_argument("--disable-notifications")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--remote-allow-origins=*")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    
    if profile_path:
        profile_path = os.path.normpath(profile_path)
        data_dir = os.path.dirname(profile_path)
        profile_name = os.path.basename(profile_path)
        
        if profile_name.lower() in ['default', 'profile 1', 'profile 2']:
             options.add_argument(f"--user-data-dir={data_dir}")
             options.add_argument(f"--profile-directory={profile_name}")
        else:
             options.add_argument(f"--user-data-dir={profile_path}")

    driver = None
    try:
        driver = webdriver.Edge(service=Service(driver_path), options=options)
        clean_num = phone.replace("+", "").strip()
        url = f"https://web.whatsapp.com/send?phone={clean_num}&text={urllib.parse.quote(message)}"
        driver.get(url)
        
        wait = WebDriverWait(driver, 60)
        locators = [
            (By.XPATH, "//div[@contenteditable='true' and @data-tab]"),
            (By.CSS_SELECTOR, "div[title='Type a message']"),
            (By.CSS_SELECTOR, "div.lexical-rich-text-input div[contenteditable='true']")
        ]
        
        box = None
        for locator in locators:
            try:
                box = wait.until(EC.presence_of_element_located(locator))
                if box: break
            except:
                continue
        
        if not box:
            raise Exception("Input box not found.")
            
        time.sleep(5)
        box.send_keys(Keys.ENTER)
        time.sleep(7)
        driver.quit()
        return True
    except Exception as e:
        print(f"❌ Automation Error: {e}")
        if driver: driver.quit()
        return False

def send_whatsapp_attach(phone, message, debugger_address='127.0.0.1:9222'):
    if webdriver is None: return False
    driver_path = get_driver_path()
    options = webdriver.EdgeOptions()
    options.add_experimental_option("debuggerAddress", debugger_address)
    
    try:
        driver = webdriver.Edge(service=Service(driver_path), options=options)
        clean_num = phone.replace("+", "").strip()
        url = f"https://web.whatsapp.com/send?phone={clean_num}&text={urllib.parse.quote(message)}"
        driver.get(url)
        
        wait = WebDriverWait(driver, 45)
        input_xpath = "//div[@contenteditable='true' and @data-tab]"
        wait.until(EC.presence_of_element_located((By.XPATH, input_xpath)))
        
        time.sleep(3)
        box = driver.find_element(By.XPATH, input_xpath)
        box.send_keys(Keys.ENTER)
        time.sleep(3)
        return True
    except Exception as e:
        print(f"❌ Attachment Sending Error: {e}")
        return False

if __name__ == "__main__":
    if not TARGET_PHONE:
        print("❌ Error: No phone number provided for alert.")
        sys.exit(1)

    print(f"📲 Alerting {TARGET_PHONE}...")
    
    # Try active browser first
    for addr in ['127.0.0.1', 'localhost']:
        if is_port_open(addr, 9222):
            if send_whatsapp_attach(TARGET_PHONE, MESSAGE, f"{addr}:9222"):
                print("✅ Delivered via Active Browser.")
                sys.exit(0)

    # Try Selenium automation
    if send_whatsapp_fast(TARGET_PHONE, MESSAGE):
        print("✅ Delivered via Selenium.")
        sys.exit(0)

    # Fallback to PyWhatKit
    try:
        pywhatkit.sendwhatmsg_instantly(TARGET_PHONE, MESSAGE, wait_time=15)
        print("✅ Delivered via PyWhatKit.")
        sys.exit(0)
    except Exception as e:
        print(f"❌ All methods failed: {e}")
        sys.exit(1)
