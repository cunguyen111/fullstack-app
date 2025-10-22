# restapis.py
import os
from urllib.parse import urlencode, quote_plus, urljoin
import requests
from dotenv import load_dotenv

load_dotenv()

# Chuẩn hóa base URL: bỏ/ thêm slash cho đúng
def _normalize_base(url: str) -> str:
    if not url:
        return ""
    url = url.strip()
    if not url.endswith("/"):
        url += "/"
    return url

backend_url = _normalize_base(os.getenv("backend_url", "http://localhost:3030"))
sentiment_analyzer_url = _normalize_base(os.getenv("sentiment_analyzer_url", "http://localhost:5050"))

DEFAULT_TIMEOUT = 10  # giây


def get_request(endpoint: str, **kwargs):
    """
    Gọi GET đến backend với params encode chuẩn.
    Trả về JSON (dict/list) hoặc None nếu lỗi.
    """
    try:
        # endpoint có thể bắt đầu bằng '/' hoặc không; urljoin xử lý ổn
        request_url = urljoin(backend_url, endpoint.lstrip("/"))
        print(f"GET {request_url} params={kwargs}")
        resp = requests.get(request_url, params=kwargs or None, timeout=DEFAULT_TIMEOUT)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        print(f"[get_request] Network/HTTP error: {e}")
    except ValueError as e:
        print(f"[get_request] JSON decode error: {e}")
    return None


def analyze_review_sentiments(text: str):
    """
    Gọi sentiment analyzer. Hỗ trợ 2 kiểu endpoint:
    - /analyze/<text-encoded>
    - /analyze?text=<text-encoded>
    Trả về dict tối thiểu: {"sentiment": "<label>"}
    """
    if not text:
        return {"sentiment": "unknown"}

    # Ưu tiên dạng path param theo code cũ
    path_style_url = urljoin(sentiment_analyzer_url, "analyze/" + quote_plus(str(text)))
    query_style_url = urljoin(sentiment_analyzer_url, "analyze")

    # Thử path-style trước, fallback sang query-style
    for request_url, params in ((path_style_url, None), (query_style_url, {"text": text})):
        try:
            print(f"GET {request_url} params={params}")
            resp = requests.get(request_url, params=params, timeout=DEFAULT_TIMEOUT)
            resp.raise_for_status()
            data = resp.json()
            # Chuẩn hóa output
            if isinstance(data, dict) and "sentiment" in data:
                return {"sentiment": data["sentiment"]}
            # Một số service trả {"result": {"label": "..."}}
            if isinstance(data, dict) and "result" in data and isinstance(data["result"], dict) and "label" in data["result"]:
                return {"sentiment": data["result"]["label"]}
            # Hoặc list kết quả
            if isinstance(data, list) and data and isinstance(data[0], dict) and "sentiment" in data[0]:
                return {"sentiment": data[0]["sentiment"]}
            # Nếu không match, trả unknown để view không vỡ
            return {"sentiment": "unknown"}
        except requests.RequestException as e:
            print(f"[analyze_review_sentiments] Network/HTTP error: {e}")
        except ValueError as e:
            print(f"[analyze_review_sentiments] JSON decode error: {e}")

    return {"sentiment": "unknown"}


def post_review(data_dict: dict):
    """
    POST review lên backend. Trả về JSON hoặc None nếu lỗi.
    """
    try:
        request_url = urljoin(backend_url, "insert_review")
        print(f"POST {request_url}")
        resp = requests.post(request_url, json=data_dict, timeout=DEFAULT_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        print(data)
        return data
    except requests.RequestException as e:
        print(f"[post_review] Network/HTTP error: {e}")
    except ValueError as e:
        print(f"[post_review] JSON decode error: {e}")
    return None
