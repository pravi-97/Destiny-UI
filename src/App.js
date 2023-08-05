import React, { useEffect, useRef } from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';

export default function App() {
    const recorderControls = useAudioRecorder();
    const startButtonRef = useRef(null);
    const stopButtonRef = useRef(null);
    const addAudioElement = async (blob) => {
        try {
            let wavBlob = blob;
            if (wavBlob) {
                const formData = new FormData();
                formData.append('audioData', wavBlob, 'audio.wav');
                // formData.append('message', 'Are you getting it?');
                // console.log('blob :', wavBlob);
                console.log("date-time at start: ", Date.now().toString());
                const response = await fetch('http://localhost:3001/getresponse', {
                    method: 'POST',
                    body: formData,
                });
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                console.log("date-time at end: ", Date.now().toString());

                // Use the audioUrl to play the speech
                const audioElement = new Audio(audioUrl);
                audioElement.play();
            }
            // Handle the response or do something with the jobName
        } catch (error) {
            console.error('Error getting response from server:', error);
        }
    };
    let isRecording = false;
    const handleKeyPress = (event) => {
        if (event.key === ' ') {
            if (!isRecording) {
                startButtonRef.current.click();
                isRecording = true;
            } else {
                stopButtonRef.current.click();
                isRecording = false;
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    return (
        <div>
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
            {recorderControls.isRecording ?
                <button id='stopButton' ref={stopButtonRef} onClick={recorderControls.stopRecording}>Stop</button> :
                <button id='startButton' ref={startButtonRef}  onClick={recorderControls.startRecording}>Start</button>
            }

        </div>
    );
}
