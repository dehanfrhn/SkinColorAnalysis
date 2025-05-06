from PIL import Image
from pipeline import pipeline as pl, segmentation_filter, user_palette_classification_filter
from palette_classification import color_processing, palette
from utils import segmentation_labels
import glob
import os

def run_color_analysis(input_path):
    palettes_path = 'palette_classification/palettes/'
    palette_files = glob.glob(palettes_path + '*.csv')
    reference_palettes = [palette.PaletteRGB().load(f, header=True) for f in palette_files]

    input_img = Image.open(input_path).convert('RGB')

    sf = segmentation_filter.SegmentationFilter('cloud')
    pl.clear_filters()  # pastikan filter tidak dobel
    pl.add_filter(sf)
    img, masks = pl.execute(input_img, device='cpu', verbose=False)

    upcf = user_palette_classification_filter.UserPaletteClassificationFilter(reference_palettes)
    pl.add_filter(upcf)

    segmented = color_processing.colorize_segmentation_masks(masks, segmentation_labels.labels)

    output_path = input_path.replace(".jpg", "_output.jpg")
    segmented.save(output_path)
    return output_path