import React, { useEffect, useRef, useState } from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';

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

            </div>
        </div>
    );
}

export default Main;