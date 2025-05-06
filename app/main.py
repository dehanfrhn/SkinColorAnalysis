from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from PIL import Image
import shutil
import os

# Import pipeline dari folder lokal
from pipeline import pipeline, segmentation_filter, user_palette_classification_filter
from palette_classification import palette, color_processing
from utils import segmentation_labels

import glob
import torch

# Buat instance pipeline
pl = pipeline.Pipeline()

app = FastAPI()

# Setup referensi palet dan model hanya sekali
if torch.backends.mps.is_available():
    device = "mps"
elif torch.cuda.is_available():
    device = "cuda"
else:
    device = "cpu"

palette_filenames = glob.glob("palette_classification/palettes/*.csv")
reference_palettes = [
    palette.PaletteRGB().load(f.replace("\\", "/"), header=True)
    for f in palette_filenames
]

BASE_DIR = Path(__file__).resolve().parent.parent
app.mount("/static", StaticFiles(directory=BASE_DIR / "app/static"), name="static")

templates = Jinja2Templates(directory=BASE_DIR / "app/templates")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/analyze", response_class=HTMLResponse)
async def analyze_image(image: UploadFile = File(...)):
    # Simpan file sementara
    temp_path = f"temp_{image.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Load image
    input_img = Image.open(temp_path).convert("RGB")

    # Buat pipeline baru setiap request
    pl = pipeline.Pipeline()
    sf = segmentation_filter.SegmentationFilter("cloud")
    upcf = user_palette_classification_filter.UserPaletteClassificationFilter(reference_palettes)

    pl.add_filter(sf)
    pl.add_filter(upcf)

    # Eksekusi pipeline
    user_palette = pl.execute(input_img, device, verbose=False)
    description = user_palette.description()

    # Hapus file sementara
    os.remove(temp_path)

    return JSONResponse(content={"palette_description": description})