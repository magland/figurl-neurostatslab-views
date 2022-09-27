# 9/21/22
# https://www.figurl.org/f?v=http://localhost:3000&d=sha1://257658d506da14071978fed607381aceb4ba6fb3&label=test%20annotate%20vocalizations&s={%22annotations%22:%22sha1://eb59c3afaab11ef4776186d5b0408ba41b21f87f%22}
# https://www.figurl.org/f?v=gs://figurl/neurostatslab-views-1dev2&d=sha1://257658d506da14071978fed607381aceb4ba6fb3&label=test%20annotate%20vocalizations&s={%22annotations%22:%22sha1://eb59c3afaab11ef4776186d5b0408ba41b21f87f%22}

import numpy as np
import kachery_cloud as kcl
import h5py
import figurl as fig
from matplotlib.pyplot import specgram

# pip install opencv-python
import cv2

def main():
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
    spectrogram_data = np.floor((spectrogram_data - minval) / (maxval - minval) * 255).astype(np.uint8)
    data = {
        'type': 'neurostatslab.AnnotateVocalizations',
        'spectrogram': {
            'data': spectrogram_data.T,
            'samplingFrequency': sr_spectrogram
        }
    }
    vocalizations_state = {
        'vocalizations': [
            {'vocalizationId': 'auto-1', 'timeIntervalSec': [0.1, 0.2], 'label': 'auto'},
            {'vocalizationId': 'auto-2', 'timeIntervalSec': [0.3, 0.4], 'label': 'auto'},
            {'vocalizationId': 'auto-3', 'timeIntervalSec': [0.5, 0.6], 'label': 'auto'},
            {'vocalizationId': 'auto-4', 'timeIntervalSec': [0.7, 0.8], 'label': 'auto'},
            {'vocalizationId': 'auto-5', 'timeIntervalSec': [0.9, 1.0], 'label': 'auto'},
            {'vocalizationId': 'auto-6', 'timeIntervalSec': [1.1, 1.2], 'label': 'auto'},
            {'vocalizationId': 'auto-7', 'timeIntervalSec': [1.3, 1.5], 'label': 'auto'}
        ]
    }
    vocalizations_state_uri = kcl.store_json(vocalizations_state)
    state = {
        'vocalizations': vocalizations_state_uri
    }
    F = fig.Figure(data=data, view_url='gs://figurl/neurostatslab-views-1dev3', state=state)
    print(F.url(label='test annotate vocalizations'))     

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