import os
import json
import base64
import urllib.request
import urllib.error

TOKEN = "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"
OWNER = "Rami-GH"
REPO = "Hackathon-2026"
BASE_URL = f"https://api.github.com/repos/{OWNER}/{REPO}"

def api_call(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Hackathon-2026-Pusher"
    }
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8")
        if e.code != 404:
            print(f"HTTP Error {e.code} for {method} {url}: {error_msg}")
        raise e

def create_or_update_file(repo_path, local_path, commit_message):
    with open(local_path, "rb") as f:
        content = base64.b64encode(f.read()).decode("utf-8")
    
    sha = None
    try:
        existing = api_call(f"/contents/{repo_path}")
        sha = existing.get("sha")
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise e
            
    payload = {
        "message": commit_message,
        "content": content,
        "branch": "main"
    }
    if sha:
        payload["sha"] = sha
        
    res = api_call(f"/contents/{repo_path}", method="PUT", data=payload)
    print(f"Successfully synced: {repo_path}")
    return res

def sync_directory(dir_path, exclude_dirs=None, exclude_files=None):
    if exclude_dirs is None:
        exclude_dirs = {".git", "node_modules", "dist", ".cache", "__pycache__"}
    if exclude_files is None:
        exclude_files = {".DS_Store", "desktop.ini"}
        
    for root, dirs, files in os.walk(dir_path):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file in exclude_files:
                continue
            local_full = os.path.join(root, file)
            rel_path = os.path.relpath(local_full, dir_path).replace("\\", "/")
            try:
                create_or_update_file(rel_path, local_full, f"Update {rel_path}")
            except Exception as e:
                print(f"Failed syncing {rel_path}: {e}")

if __name__ == "__main__":
    print(f"Testing GitHub API connection for {OWNER}/{REPO}...")
    res = api_call("")
    print(f"Connected to repo: {res['full_name']}")
