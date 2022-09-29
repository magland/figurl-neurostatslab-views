# 9/29/22
# https://figurl.org/f?v=gs://figurl/neurostatslab-views-1dev5&d=sha1://e1e81ecd1d3b28ac8284ed0d51684b6c3a4bfdfc&s={"vocalizations":"sha1://fad5a8231dc33a6cb6495007e466d104e03edb33"}&label=test%20annotate%20vocalizations

# dev
# https://www.figurl.org/f?v=http://localhost:3000&d=sha1://e1e81ecd1d3b28ac8284ed0d51684b6c3a4bfdfc&s={%22vocalizations%22:%22sha1://fad5a8231dc33a6cb6495007e466d104e03edb33%22,%22poses%22:%22sha1://f213f711d0d96af2a41d95b239c802222afa7185%22}&label=test%20annotate%20vocalizations

from typing import Union
import numpy as np
import kachery_cloud as kcl
import h5py
import figurl as fig
from matplotlib.pyplot import specgram

# pip install opencv-python
import cv2

def main():
    # ffmpeg -i test1.mp4 -c:v libtheora -q:v 7 -c:a libvorbis -q:a 4 test1.ogv
    video_uri = 'sha1://54c5a68707779d3e920c70443bced94250154af1?label=2022_01_17_13_59_02_792530_cam_a.ogv'
    video_dims = [512, 640]
    sr_video = 30

    fname_h5 = kcl.load_file('sha1://149e7e83682c3e0fbbef4dbb9153f469430464cb?label=mic_2022_01_17_13_59_02_792530.h5')
    sr_audio = 125000 #sampling rate, audio
    duration_sec = 60 * 5

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
        X = X[0:int(duration_sec * sr_audio)]

        num_channels = X.shape[1]
    spectrograms = []
    for channel_ind in range(num_channels):
        s, f, t, im = specgram(X[:, channel_ind], NFFT=512, noverlap=256, Fs=sr_audio)
        sr_spectrogram = 1 / (t[1] - t[0])
        spectrograms.append(s)
    spectrogram_data = sum(spectrograms)
    maxval = np.max(spectrogram_data)
    maxval = maxval / 200
    minval = 0

    # Nf x Nt
    spectrogram_data = np.floor((spectrogram_data - minval) / (maxval - minval) * 255).astype(np.uint8)

    auto_vocalizations = _auto_detect_vocalizations(spectrogram_data[130:230], sampling_frequency=sr_spectrogram)

    data = {
        'type': 'neurostatslab.AnnotateVocalizations',
        'spectrogram': {
            'data': spectrogram_data.T,
            'samplingFrequency': sr_spectrogram
        },
        'video': {
            'uri': video_uri,
            'samplingFrequency': sr_video,
            'width': video_dims[1],
            'height': video_dims[0]
        }
    }
    labels = ['auto']
    vocalizations_state = {
        'samplingFrequency': sr_spectrogram,
        'vocalizations': auto_vocalizations
    }
    vocalizations_state_uri = kcl.store_json(vocalizations_state)
    state = {
        'vocalizations': vocalizations_state_uri
    }
    F = fig.Figure(data=data, view_url='gs://figurl/neurostatslab-views-1dev5', state=state)
    print(F.url(label='test annotate vocalizations'))

def _auto_detect_vocalizations(spectrogram: np.array, *, sampling_frequency: float):
    vocalizations = []
    max_gap = 20
    min_size = 10
    voc_ind = 0
    a = np.max(spectrogram, axis=0)
    vocalization_start_frame: Union[int, None] = None
    vocalization_last_active_frame: Union[int, None] = None
    for i in range(len(a)):
        if a[i] > 0:
            # non-zero value
            if vocalization_start_frame is None:
                # not in a potential vocalization
                vocalization_start_frame = i
            vocalization_last_active_frame = i
        else:
            # zero value
            if vocalization_last_active_frame is not None:
                # in a potential vocalization
                if i - vocalization_last_active_frame >= max_gap:
                    # it's been long enough since we had a non-zero value
                    if vocalization_last_active_frame - vocalization_start_frame >= min_size:
                        # the vocalization was long enough
                        vocalizations.append(
                            {'vocalizationId': f'auto-{voc_ind}', 'startFrame': vocalization_start_frame, 'endFrame': vocalization_last_active_frame + 1, 'labels': ['auto']}
                        )
                        voc_ind = voc_ind + 1
                    vocalization_start_frame = None
                    vocalization_last_active_frame = None
    return vocalizations


    raise Exception('Error')
    # [
    #         {'vocalizationId': 'auto-1', 'timeIntervalSec': [0.1, 0.2], 'labels': labels},
    #         {'vocalizationId': 'auto-2', 'timeIntervalSec': [0.3, 0.4], 'labels': labels},
    #         {'vocalizationId': 'auto-3', 'timeIntervalSec': [0.5, 0.6], 'labels': labels},
    #         {'vocalizationId': 'auto-4', 'timeIntervalSec': [0.7, 0.8], 'labels': labels},
    #         {'vocalizationId': 'auto-5', 'timeIntervalSec': [0.9, 1.0], 'labels': labels},
    #         {'vocalizationId': 'auto-6', 'timeIntervalSec': [1.1, 1.2], 'labels': labels},
    #         {'vocalizationId': 'auto-7', 'timeIntervalSec': [1.3, 1.5], 'labels': labels}
    #     ]

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

if __name__ == '__main__':
    main()