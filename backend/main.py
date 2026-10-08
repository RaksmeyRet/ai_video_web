import shutil
import sqlite3
import uuid
from contextlib import closing
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

BASE = Path(__file__).parent
UPLOADS = BASE / "uploads"
UPLOADS.mkdir(exist_ok=True)
DB_PATH = BASE / "videos.db"

MAX_MB = 500
ALLOWED_EXT = {".mp4", ".mov", ".webm"}

app = FastAPI(title="KHEMRA NEXUS API")

# Allow the Quasar dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded videos at /uploads/<file>
app.mount("/uploads", StaticFiles(directory=UPLOADS), name="uploads")


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


with closing(connect()) as conn:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS videos (
            video_id    INTEGER PRIMARY KEY AUTOINCREMENT,
            filename    TEXT NOT NULL,
            stored_name TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            size_bytes  INTEGER NOT NULL,
            created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()


def to_dict(row, request: Request):
    return {
        "video_id": row["video_id"],
        "title": row["filename"],
        "description": row["description"],
        "size_bytes": row["size_bytes"],
        "created_at": row["created_at"],
        "url": f"{request.base_url}uploads/{row['stored_name']}",
    }


@app.post("/api/videos", status_code=201)
def upload_video(
    request: Request,
    file: UploadFile = File(...),
    description: str = Form(""),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "Only MP4, MOV, or WebM videos are allowed.")

    stored_name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOADS / stored_name

    # Stream to disk so large videos do not fill memory
    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    size = dest.stat().st_size
    if size > MAX_MB * 1024 * 1024:
        dest.unlink(missing_ok=True)
        raise HTTPException(413, f"Video is larger than {MAX_MB} MB.")

    with closing(connect()) as conn:
        cur = conn.execute(
            "INSERT INTO videos (filename, stored_name, description, size_bytes) VALUES (?, ?, ?, ?)",
            (file.filename, stored_name, description.strip(), size),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM videos WHERE video_id = ?", (cur.lastrowid,)).fetchone()

    # TODO: start your AI pipeline here (transcribe, split into segments, embed)
    return to_dict(row, request)


@app.get("/api/videos")
def list_videos(request: Request):
    with closing(connect()) as conn:
        rows = conn.execute("SELECT * FROM videos ORDER BY video_id DESC").fetchall()
    return [to_dict(r, request) for r in rows]


@app.get("/api/videos/{video_id}")
def get_video(video_id: int, request: Request):
    with closing(connect()) as conn:
        row = conn.execute("SELECT * FROM videos WHERE video_id = ?", (video_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Video not found.")
    return to_dict(row, request)


@app.get("/api/videos/{video_id}/segments")
def get_segments(video_id: int):
    # TODO: return real segments from your AI pipeline.
    # Fields: segment_id, video_id, start, end, title, summary, keywords, possible_questions
    return []