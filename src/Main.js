import React, { useEffect, useRef, useState } from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
let processing = false;

const Main = () => {
    const recorderControls = useAudioRecorder();
    const startButtonRef = useRef(null);
    const stopButtonRef = useRef(null);   
    const [isProcessing, setIsProcessing] = useState(false);
    const addAudioElement = async (blob) => {
       
        try {
            let wavBlob = blob;
            if (wavBlob) {
                processing = true;
                setIsProcessing(true);
                const formData = new FormData();
                formData.append('audioData', wavBlob, 'audio.wav');
                let d1 = Date.now();
                const response = await fetch('http://localhost:3001/getresponse', {
                    method: 'POST',
                    body: formData,
                });
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                let d2 = Date.now();
                console.log('Time taken to get response:', (d2 - d1)/1000);
                const audioElement = new Audio(audioUrl);
                audioElement.play();
                processing = false;
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Error getting response from server:', error);
        }
    };
    let isRecording = false;
    const handleKeyPress = (event) => {
        if (event.key === ' ') {
            if (!processing){
                if (!isRecording) {
                    if (startButtonRef && startButtonRef.current) {
                        startButtonRef.current.click();
                        isRecording = true;
                    }
                } else {
                    if (stopButtonRef && stopButtonRef.current) {
                        stopButtonRef.current.click();
                        isRecording = false;
                    }
                }
            }
            else alert("Previous audio is processing");
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

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
    }

    return (
        <div className='mainSection'>
            <AudioRecorder
                onRecordingComplete={addAudioElement}
                audioTrackConstraints={{
                    noiseSuppression: true,
                    echoCancellation: true,
                    // autoGainControl,
                    // channelCount,
                    // deviceId,
                    // groupId,
                    // sampleRate,
                    // sampleSize,
                }}
                onNotAllowedOrFound={(err) => console.table(err)}
                // downloadOnSavePress={true}
                // downloadFileExtension="wav"
                mediaRecorderOptions={{
                    audioBitsPerSecond: 128000,
                }}
                showVisualizer={true}
                recorderControls={recorderControls}
            />
            <br />
            <div className='centerThem'>
                {isProcessing ? (
                    <div className='centerText'>Processing...</div>
                ) : recorderControls.isRecording ? (
                    <div>
                        <div className='centerText'>Listening...</div>
                        <button className='centerButton' id='stopButton' ref={stopButtonRef} onClick={recorderControls.stopRecording}>Stop</button>
                    </div>
                ) : (
                    <div>
                        <div className='centerText'>Click to start</div>
                        <button className='centerButton' id='startButton' ref={startButtonRef} onClick={recorderControls.startRecording}>Start</button>
                    </div>
                )}
                {/* <button id="record" onClick={startRecording}>
                    Record
                </button> */}
                <div id="mic" style={{ border: '1px solid #ddd', borderRadius: '4px', marginTop: '1rem' }} ref={micRef}></div>
            </div>
        </div>
    );
}

export default Main;