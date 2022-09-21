# 9/21/22
# https://www.figurl.org/f?v=http://localhost:3000&d=sha1://b506787e0a00a7542ed245475efb8f222701827e&label=test%20spectrograms&s={%22postureAnnotations%22:%22sha1://da8ac9149f10556e602be5560c9c40fbb2a5481a%22}
# https://www.figurl.org/f?v=gs://figurl/neurostatslab-views-1dev2&d=sha1://b506787e0a00a7542ed245475efb8f222701827e&label=test%20spectrograms&s={%22postureAnnotations%22:%22sha1://da8ac9149f10556e602be5560c9c40fbb2a5481a%22}

from os import path

import numpy as np
import math
import kachery_cloud as kcl
import h5py
import figurl as fig
from matplotlib.pyplot import specgram

# pip install opencv-python
import cv2

def main():
    vid_fpath = kcl.load_file('sha1://a9fc5dc257e9a5c2e0af51114446bd39a44b8de0?label=2022_01_17_13_59_02_792530_cam_a.avi')
    if not path.exists(vid_fpath) or path.isdir(vid_fpath):
        raise ValueError("Expected a path to an existing video file.")
    video_capture = cv2.VideoCapture(vid_fpath)
    sr_video = get_fps(video_capture)

    fname_h5 = kcl.load_file('sha1://149e7e83682c3e0fbbef4dbb9153f469430464cb?label=mic_2022_01_17_13_59_02_792530.h5')
    sr_audio = 125000 #sampling rate, audio
    snippet_duration_sec = 0.5
    detect_threshold = 0.03 # for detecting events
    detect_interval_sec = 1
    detect_channel_ind = 1
    num_events = 20

    # open the audio hdf5 file
    with h5py.File(fname_h5, 'r') as f:
        # print the items
        print('Items in hdf5 file')
        def print_item(name, obj):
            print(name, dict(obj.attrs))
        f.visititems(print_item)
        print('')
        
        ch1 = np.array(f['ai_channels/ai0'])
        ch2 = np.array(f['ai_channels/ai1'])
        ch3 = np.array(f['ai_channels/ai2'])
        ch4 = np.array(f['ai_channels/ai3'])
        X = np.stack([ch1, ch2, ch3, ch4]).T
        maxval = np.max(X)
        print(f'Max. val = {maxval}')

        # crop to first 60 seconds
        X = X[0:int(60 * sr_audio)]

        num_channels = X.shape[1]
        event_times_sec = detect_on_channel(
            data=X[:, detect_channel_ind],
            detect_threshold=detect_threshold,
            detect_interval=int(sr_audio * detect_interval_sec),
            detect_sign=1
        ) / sr_audio

        # skip first 10 seconds - artifacts
        event_times_sec = event_times_sec[event_times_sec >= 10]

        # limit events
        event_times_sec = event_times_sec[:num_events]
        print(event_times_sec)

        events = []
        for t0 in event_times_sec:
            i1 = int(np.floor((t0 - snippet_duration_sec / 2) * sr_audio))
            i2 = int(np.floor((t0 + snippet_duration_sec / 2) * sr_audio))
            snippet = X[i1:i2]

            spectrograms = []
            for channel_ind in range(num_channels):
                s, f, t, im = specgram(snippet[:, channel_ind], NFFT=512, noverlap=256, Fs=sr_audio)
                sr_spectrogram = 1 / (t[1] - t[0])
                spectrograms.append(s.T)
            minval = np.min([np.min(a) for a in spectrograms])
            maxval = np.max([np.max(a) for a in spectrograms])
            spectrograms = [
                np.floor((s - minval) / (maxval - minval) * 255).astype(np.uint8)
                for s in spectrograms
            ]
            camera_image = get_frame(video_capture, int(np.floor(t0 * sr_video)))
            events.append({
                'eventId': f'evt:{t0}',
                't': t0,
                'spectrograms': spectrograms,
                'cameraImage': camera_image
            })
        data = {
            'type': 'neurostatslab.TestSpectrograms',
            'events': events
        }
        F = fig.Figure(data=data, view_url='http://localhost:3000')
        print(F.url(label='test spectrograms'))     

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

def get_fps(stream: cv2.VideoCapture):
    """Attempts to retrieve the framerate from the video metadata."""
    return stream.get(cv2.CAP_PROP_FPS)

# from mountainsort4
def detect_on_channel(data: np.ndarray, *, detect_threshold: float, detect_interval: float, detect_sign: int, margin: int=0):
    # Adjust the data to accommodate the detect_sign
    # After this adjustment, we only need to look for positive peaks
    if detect_sign < 0:
        data = data*(-1)
    elif detect_sign == 0:
        data = np.abs(data)
    elif detect_sign > 0:
        pass

    data = data.ravel()

    # An event at timepoint t is flagged if the following two criteria are met:
    # 1. The value at t is greater than the detection threshold (detect_threshold)
    # 2. The value at t is greater than the value at any other timepoint within plus or minus <detect_interval> samples

    # First split the data into segments of size detect_interval (don't worry about timepoints left over, we assume we have padding)
    N = len(data)
    S2 = math.floor(N / detect_interval)
    N2 = S2 * detect_interval
    data2 = np.reshape(data[0:N2], (S2, detect_interval))

    # Find the maximum on each segment (these are the initial candidates)
    max_inds2 = np.argmax(data2, axis=1)
    max_inds = max_inds2+detect_interval*np.arange(0, S2)
    max_vals = data[max_inds]

    # The following two tests compare the values of the candidates with the values of the neighbor candidates
    # If they are too close together, then discard the one that is smaller by setting its value to -1
    # Actually, this doesn't strictly satisfy the above criteria but it is close
    # TODO: fix the subtlety
    max_vals[np.where((max_inds[0:-1] >= max_inds[1:]-detect_interval)
                      & (max_vals[0:-1] < max_vals[1:]))[0]] = -1
    max_vals[1+np.array(np.where((max_inds[1:] <= max_inds[0:-1] +
                        detect_interval) & (max_vals[1:] <= max_vals[0:-1]))[0])] = -1

    # Finally we use only the candidates that satisfy the detect_threshold condition
    times = max_inds[np.where(max_vals >= detect_threshold)[0]]
    if margin > 0:
        times = times[np.where((times >= margin) & (times < N-margin))[0]]

    return times

if __name__ == '__main__':
    main()