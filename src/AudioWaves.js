import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';

const AudioWaves = () => {
    const micRef = useRef(null);
    const recordingsRef = useRef(null);
    const wavesurferRef = useRef(null);
    const recordPluginRef = useRef(null);

    useEffect(() => {
        // Create an instance of WaveSurfer
        wavesurferRef.current = WaveSurfer.create({
            container: micRef.current,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
        });

        // Initialize the Record plugin
        recordPluginRef.current = wavesurferRef.current.registerPlugin(RecordPlugin.create());

        // Event handler for recording end
        recordPluginRef.current.on('record-end', (blob) => {
            const recordedUrl = URL.createObjectURL(blob);
            const container = recordingsRef.current;

            // Create a new WaveSurfer instance for the recorded audio
            const recordedWaveSurfer = WaveSurfer.create({
                container,
                waveColor: 'rgb(200, 100, 0)',
                progressColor: 'rgb(100, 50, 0)',
                url: recordedUrl,
            });
            recordedWaveSurfer.on('interaction', () => recordedWaveSurfer.playPause());

            // Create a download link
            const link = document.createElement('a');
            link.href = recordedUrl;
            link.download = `recording.${blob.type.split(';')[0].split('/')[1] || 'webm'}`;
            link.textContent = 'Download recording';
            link.style.display = 'block';
            link.style.margin = '1rem 0 2rem';
            container.appendChild(link);
        });
    }, []);

    const startRecording = async () => {
        const recButton = document.querySelector('#record');

        if (recordPluginRef.current.isRecording()) {
            await recordPluginRef.current.stopRecording();
            recButton.textContent = 'Record';
            return;
        }

        recButton.disabled = true;

        await recordPluginRef.current.startRecording();
        recButton.textContent = 'Stop';
        recButton.disabled = false;
    };

    return (
        <div>
            <h1 style={{ marginTop: 0 }}>Press Record to start recording 🎙️</h1>
            <p>
                📖 <a href="https://wavesurfer-js.org/docs/classes/plugins_record.RecordPlugin">Record plugin docs</a>
            </p>
            <button id="record" onClick={startRecording}>
                Record
            </button>
            <div id="mic" style={{ border: '1px solid #ddd', borderRadius: '4px', marginTop: '1rem' }} ref={micRef}></div>
            <div id="recordings" style={{ margin: '1rem 0' }} ref={recordingsRef}></div>
        </div>
    );
};

export default AudioWaves;
