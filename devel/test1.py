# 9/20/22
# https://www.figurl.org/f?v=gs://figurl/neurostatslab-views-1dev&d=sha1://30312e61b22cdff4d595b6f89c3ee35a64e7d4f9&label=test%20annotate%20gerbil%20posture&s={%22postureAnnotations%22:%22sha1://65cfe046d2b63d32f364f28cd515ee5bc643c89e%22}
# https://www.figurl.org/f?v=http://localhost:3000&d=sha1://30312e61b22cdff4d595b6f89c3ee35a64e7d4f9&label=test%20annotate%20gerbil%20posture&s={%22postureAnnotations%22:%22sha1://65cfe046d2b63d32f364f28cd515ee5bc643c89e%22}

from os import path

# pip install opencv-python
import cv2

import figurl as fig
import kachery_cloud as kcl


def main():
    # ffmpeg -i test1.mp4 -c:v libtheora -q:v 7 -c:a libvorbis -q:a 4 test1.ogv

    # vid_fpath = kcl.load_file('sha1://a9fc5dc257e9a5c2e0af51114446bd39a44b8de0?label=2022_01_17_13_59_02_792530_cam_a.avi')
    vid_fpath = kcl.load_file('sha1://54c5a68707779d3e920c70443bced94250154af1?label=2022_01_17_13_59_02_792530_cam_a.ogv')
    if not path.exists(vid_fpath) or path.isdir(vid_fpath):
        raise ValueError("Expected a path to an existing video file.")
    cap = cv2.VideoCapture(vid_fpath)

    print(f"Framerate: {get_fps(cap)}fps.")
    print(f"Frame count: {get_frame_count(cap)} frames.")
    print(f"Sample frame shape: {get_frame(cap, 60).shape}")

    frames = [
        {
            'frameId': f'f-{aa}',
            'image': get_frame(cap, aa)
        }
        for ii, aa in enumerate(range(3000, 8000, 500))
    ]

    data = {
        'type': 'neurostatslab.AnnotateGerbilPosture',
        'frames': frames
    }
    F = fig.Figure(data=data, view_url='gs://figurl/neurostatslab-views-1dev')
    print(F.url(label='test annotate gerbil posture'))

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
