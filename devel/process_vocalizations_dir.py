import os
from typing import List, Union
import click
import h5py
import numpy as np
from matplotlib.pyplot import specgram

import kachery_cloud as kcl
import figurl as fig


@click.group(help='''
Process vocalizations dir

Step 1: Prepare the .ogv file

Run:
python process_vocalizationd_dir --prepare-video-ogv <dirname>

This will print instructions for creating the .ogv file and uploading it to kachery-cloud.

Step 2: Create the figURL

Using default options, run:
python process_vocalizationd_dir --create-figurl sha1://... <dirname>

For more info run:
python process_vocalizationd_dir --create-figurl --help
''')
def cli():
    pass

@click.command(help="Prepare the video .ogv file")
@click.argument('dirname')
def prepare_video_ogv(dirname: str):
    fnames = os.listdir(dirname)
    ogv_fnames = [f for f in fnames if f.endswith('.ogv')]
    if len(ogv_fnames) == 0:
        avi_fnames = [f for f in fnames if f.endswith('.avi')]
        if len(avi_fnames) == 0:
            raise Exception('.avi file not found in directory {dirname}')
        if len(avi_fnames) > 1:
            raise Exception('More than one .avi file found in directory {dirname}')
        avi_fname = avi_fnames[0]
        ogv_fname = avi_fname[:len(avi_fname) - 4] + '.ogv'
        avi_path = f'{dirname}/{avi_fname}'
        ogv_path = f'{dirname}/{ogv_fname}'
        print('')
        print('Run the following command to generate the .ogv file:')
        print(f'singularity exec docker://jrottenberg/ffmpeg ffmpeg -i {avi_path} -c:v libtheora -q:v 7 -c:a libvorbis -q:a 4 {ogv_path}')
    elif len(ogv_fnames) > 1:
        raise Exception('More than one .ogv file found in directory {dirname}')
    else:
        ogv_fname = ogv_fnames[0]
        ogv_path = f'{dirname}/{ogv_fname}'
        print(f'Found .ogv file: {ogv_path}')
    print('')
    print('Upload to kachery and copy the URI')
    print(f'kachery-cloud-store {ogv_path}')

@click.command(help="Create figURL")
@click.argument('dirname')
@click.option('--video-uri', default='', help='Optional kachery URI for the video .ogv file. If not provided, it will be determined from the .ogv file in the dataset directory.')
@click.option('--video-dims', default='512,640', help='Comma-separated pixel dimensions of the video in format height,width')
@click.option('--video-sr', default='30', help='Video sampling rate in Hz')
@click.option('--audio-sr', default='125000', help='Audio sampling rate in Hz')
@click.option('--duration-sec', default='300', help='Duration to extract (seconds)')
@click.option('--vocalizations-gh-uri', default='', help='Write auto-generated vocalizations to this Github URI (e.g., gh://user/repo/folder/vocalizations.json)')
def create_figurl(*, dirname: str, video_uri: str, video_dims: str, video_sr: str, audio_sr: str, duration_sec: str, vocalizations_gh_uri: str):
    if not video_uri:
        ogv_fname = _find_ogv_file_in_dir(dirname)
        # video_uri = kcl.store_file_local(ogv_fname) # don't auto-upload, instead just compute the hash, and we assume it was uploaded in the previous step (better to make user do this explicitly)
        from kachery_cloud.store_file_local import _compute_file_hash
        sha1 = _compute_file_hash(ogv_fname, algorithm='sha1')
        video_uri = f'sha1://{sha1}'

    video_dims = [int(video_dims.split(',')[0]), int(video_dims.split(',')[1])]
    video_sr = float(video_sr)
    audio_sr = float(audio_sr)
    duration_sec = float(duration_sec)

    h5_fnames = [fname for fname in os.listdir(dirname) if fname.endswith('.h5')]
    if len(h5_fnames) == 0:
        raise Exception(f'.h5 file not found in directory {dirname}')
    if len(h5_fnames) > 1:
        raise Exception(f'More than one .h5 file found in directory {dirname}')
    fname_h5 = f'{dirname}/{h5_fnames[0]}'
    print(f'Using {fname_h5}')

    print('Extracting audio signals')
    with h5py.File(fname_h5, 'r') as f:
        ch1 = np.array(f['ai_channels/ai0'])
        ch2 = np.array(f['ai_channels/ai1'])
        ch3 = np.array(f['ai_channels/ai2'])
        ch4 = np.array(f['ai_channels/ai3'])
        X = np.stack([ch1, ch2, ch3, ch4]).T

        # crop to duration
        X = X[0:int(duration_sec * audio_sr)]

        num_channels = X.shape[1]

    print('Computing spectrograms')
    spectrograms = []
    for channel_ind in range(num_channels):
        s, f, t, im = specgram(X[:, channel_ind], NFFT=512, noverlap=256, Fs=audio_sr)
        sr_spectrogram = 1 / (t[1] - t[0])
        spectrograms.append(s)
    spectrogram_data = sum(spectrograms)

    print(f'Spectrogram sampling rate (Hz): {sr_spectrogram}')

    print('Auto detecting maxval')
    maxval = _auto_detect_spectrogram_maxval(spectrogram_data, sr_spectrogram=sr_spectrogram)
    minval = 0
    print(f'Absolute spectrogram max: {np.max(spectrogram_data)}')
    print(f'Auto detected spectrogram max: {maxval}')

    print('Scaling spectogram data')
    # Nf x Nt
    spectrogram_data = np.floor((spectrogram_data - minval) / (maxval - minval) * 255).astype(np.uint8)

    print('Auto detecting vocalizations')
    auto_vocalizations = _auto_detect_vocalizations(spectrogram_data[130:230], sampling_frequency=sr_spectrogram)

    print('Assembling data')
    data = {
        'type': 'neurostatslab.AnnotateVocalizations',
        'spectrogram': {
            'data': spectrogram_data.T,
            'samplingFrequency': sr_spectrogram
        },
        'video': {
            'uri': video_uri,
            'samplingFrequency': video_sr,
            'width': video_dims[1],
            'height': video_dims[0]
        }
    }
    vocalizations_state = {
        'samplingFrequency': sr_spectrogram,
        'vocalizations': auto_vocalizations
    }

    if vocalizations_gh_uri:
        import fitgit
        C = fitgit.Commit()
        user, repo, branch, filename = _parse_github_uri(vocalizations_gh_uri)
        C.add_json_file(filename, vocalizations_state)
        C.push_to_github(f'{user}/{repo}', branch=branch, message='Auto set vocalizations')
        vocalizations_state_uri = vocalizations_gh_uri
    else:
        vocalizations_state_uri = kcl.store_json(vocalizations_state)
    state = {
        'vocalizations': vocalizations_state_uri
    }
    F = fig.Figure(data=data, view_url='gs://figurl/neurostatslab-views-1dev6', state=state)
    print(F.url(label=os.path.basename(fname_h5)))

def _auto_detect_spectrogram_maxval(spectrogram: np.array, *, sr_spectrogram: float):
    Nf = spectrogram.shape[0]
    Nt = spectrogram.shape[1]
    chunk_num_samples = int(15 * sr_spectrogram)
    chunk_maxvals: List[float] = []
    i = 0
    while i + chunk_num_samples < Nt:
        chunk = spectrogram[:, i:i + chunk_num_samples]
        chunk_maxvals.append(np.max(chunk))
        i += chunk_num_samples
    v = np.median(chunk_maxvals)
    return v

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

def _parse_github_uri(uri: str):
    if not uri.startswith('gh://'):
        raise Exception(f'Invalid github URI: {uri}')
    a = uri.split('/')
    if len(a) < 6:
        raise Exception(f'Invalid github URI: {uri}')
    user_name = a[2]
    repo_name = a[3]
    branch_name = a[4]
    file_name = '/'.join(a[5:])
    return user_name, repo_name, branch_name, file_name

def _find_ogv_file_in_dir(dirname: str):
    fnames = os.listdir(dirname)
    ogv_fnames = [f for f in fnames if f.endswith('.ogv')]
    if len(ogv_fnames) == 0:
        raise Exception(f'No .ogv file found in directory: {dirname}')
    if len(ogv_fnames) > 1:
        raise Exception(f'More than one .ogv file found in directory: {dirname}')
    return f'{dirname}/{ogv_fnames[0]}'

cli.add_command(prepare_video_ogv)
cli.add_command(create_figurl)

if __name__ == '__main__':
    cli()
