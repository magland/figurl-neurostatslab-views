# 9/20/22
# https://www.figurl.org/f?v=gs://figurl/neurostatslab-views-1dev&d=sha1://30312e61b22cdff4d595b6f89c3ee35a64e7d4f9&label=test%20annotate%20gerbil%20posture&s={%22postureAnnotations%22:%22sha1://65cfe046d2b63d32f364f28cd515ee5bc643c89e%22}
# https://www.figurl.org/f?v=http://localhost:3000&d=sha1://30312e61b22cdff4d595b6f89c3ee35a64e7d4f9&label=test%20annotate%20gerbil%20posture&s={%22postureAnnotations%22:%22sha1://65cfe046d2b63d32f364f28cd515ee5bc643c89e%22}

import base64
from email.mime import image
from io import BytesIO
from os import path
from typing import List

# pip install opencv-python
import cv2

import figurl as fig
import kachery_cloud as kcl
import numpy as np
from PIL import Image


def main():
    vid_fpath = kcl.load_file('sha1://a9fc5dc257e9a5c2e0af51114446bd39a44b8de0?label=2022_01_17_13_59_02_792530_cam_a.avi')
    if not path.exists(vid_fpath) or path.isdir(vid_fpath):
        raise ValueError("Expected a path to an existing video file.")
    cap = cv2.VideoCapture(vid_fpath)

    print(f"Framerate: {get_fps(cap)}fps.")
    print(f"Frame count: {get_frame_count(cap)} frames.")
    print(f"Sample frame shape: {get_frame(cap, 60).shape}")

    frames = []
    quality = 15
    for i in range(int(get_frame_count(cap))):
        f = get_frame(cap, i)
        temp_buffer = BytesIO()
        Image.fromarray(f).save(temp_buffer, format='jpeg', quality=quality)
        x_b64 = base64.b64encode(temp_buffer.getvalue()).decode('utf-8')
        frames.append(x_b64)
    print(sum([len(f) for f in frames])/1e6)


    # a1 = get_frame(cap, 60)
    # a2 = get_frame(cap, 61)
    # quality = 95
    # Image.fromarray(a1).save('test1.jpg', quality=quality)
    # Image.fromarray(a2).save('test2.jpg', quality=quality)
    # quality = 15
    # Image.fromarray(a1).save('test1c.jpg', quality=quality)
    # Image.fromarray(a2).save('test2c.jpg', quality=quality)
    # quality = 3
    # Image.fromarray(a1).save('test1d.jpg', quality=quality)
    # Image.fromarray(a2).save('test2d.jpg', quality=quality)

    # frames = [get_frame(cap, ii) for ii in range(60, 60 + 90)]
    # frames_grid = _create_grid(frames, num_rows=9)
    # quality = 15
    # Image.fromarray(frames_grid).save('test_concat1.jpg', quality=quality)

    # frames = [
    #     {
    #         'frameId': f'f-{aa}',
    #         'image': get_frame(cap, aa)
    #     }
    #     for ii, aa in enumerate(range(3000, 8000, 500))
    # ]

    # data = {
    #     'type': 'neurostatslab.AnnotateGerbilPosture',
    #     'frames': frames
    # }
    # F = fig.Figure(data=data, view_url='gs://figurl/neurostatslab-views-1dev')
    # print(F.url(label='test annotate gerbil posture'))

def _create_grid(a: List[np.array], *, num_rows):
    num_cols = int(np.ceil(len(a) / num_rows))
    w = a[0].shape[1]
    h = a[0].shape[0]
    ret = np.zeros((h * num_rows, w * num_cols, 3), dtype=np.uint8)
    for i in range(len(a)):
        rr = int(np.floor(i / num_cols))
        cc = i % num_cols
        ret[(rr * h):((rr + 1)*h), (cc * w):((cc + 1)*w)] = a[i]
    return ret

def get_frame(stream: cv2.VideoCapture, frame_idx: int):
    """Seeks to a given frame ID and returns the corresponding frame
    as a numpy array.
    """
    stream.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame = stream.read()
    if not ret:
        raise ValueError(
            "Failed to read from stream. Frame index possibly out of bounds."
        )
    return frame  # Should have shape (height, width, channels)

def get_frame_count(stream: cv2.VideoCapture):
    """Attempts to retrieve the frame count from the video metadata."""
    return stream.get(cv2.CAP_PROP_FRAME_COUNT)

def get_fps(stream: cv2.VideoCapture):
    """Attempts to retrieve the framerate from the video metadata."""
    return stream.get(cv2.CAP_PROP_FPS)


if __name__ == '__main__':
    main()
