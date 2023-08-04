import React from 'react';
import { AudioRecorder } from 'react-audio-voice-recorder';

export default function App() {
    const addAudioElement = async (blob) => {

        try {
            let wavBlob = blob;
            if (wavBlob) {
                const formData = new FormData();
                formData.append('audioData', wavBlob, 'audio.wav');
                // formData.append('message', 'Are you getting it?');
                // console.log('blob :', wavBlob);
                console.log("date-time at start: ", Date.now().toString());
                const response = await fetch('http://localhost:3001/transcribe', {
                    method: 'POST',
                    body: formData,
                });
                // const data = await response.json();
                // console.log('Transcription Job Name:', data);
                // Handle the response or do something with the jobName
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                console.log("date-time at end: ", Date.now().toString());

                // Use the audioUrl to play the speech
                const audioElement = new Audio(audioUrl);
                audioElement.play();
            }
            // Handle the response or do something with the jobName
        } catch (error) {
            console.error('Error starting transcription:', error);
        }
    };


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
                downloadFileExtension="wav"
                mediaRecorderOptions={{
                    audioBitsPerSecond: 128000,
                }}
                showVisualizer={true}
            />
            <br />
        </div>
    );
}
