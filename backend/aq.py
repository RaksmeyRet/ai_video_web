"""Ask questions to the video-segment search API.

Run:   python ask.py
Needs: nothing to install (uses only the Python standard library).
"""
import json
import urllib.error
import urllib.request

API_URL = "http://172.16.10.111:8000/api/rag/search/"
TOP_K = 3          # how many results to return
THRESHOLD = 0.30   # ignore results with a lower similarity score


def search(question):
    # body = json.dumps({"question": question, "top_k": TOP_K, "threshold": THRESHOLD}).encode("utf-8")
    body = json.dumps({"question": question, "top_k": 1, "threshold": THRESHOLD}).encode("utf-8")
    req = urllib.request.Request(API_URL, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def show(data):
    results = data["results"]
    if not results:
        print("\nNo matching video segment found.\n")
        return
    print(f"\nFound {data['count']} matching segment(s):\n")
    for i, r in enumerate(results, start=1):
        print(f"{i}. {r['title']}   (score: {r['score']:.3f})")
        print(f"   Video:   {r['video_id']}")
        print(f"   Time:    {r['time']}")
        print(f"   Summary: {r['summary']}")
        print()


def main():
    print("Video Segment Search  (type 'q' to quit)")
    while True:
        question = input("\nYour question: ").strip()
        if question.lower() in ("q", "quit", "exit"):
            break
        if not question:
            continue
        try:
            show(search(question))
        except urllib.error.URLError as e:
            print(f"\nCannot reach the API ({e}). Is 'docker compose up' running?")
        except Exception as e:
            print(f"\nError: {e}")


if __name__ == "__main__":
    main()