
document.addEventListener('DOMContentLoaded', () => {
    const recordButton = document.getElementById('recordButton');
    const statusText = document.getElementById('statusText');
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    
    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];

    // 👉 put your backend URL here:
    const BACKEND_URL = "https://your-ngrok-url.ngrok.io/predict"; //dummy
    
    recordButton.addEventListener('click', async () => {
        if (!isRecording) {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                
                mediaRecorder.ondataavailable = (e) => {
                    audioChunks.push(e.data);
                };
                
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks);
                    await processAudio(audioBlob);
                };
                
                mediaRecorder.start();
                isRecording = true;
                recordButton.classList.add('recording-animation');
                statusText.textContent = 'Recording...';
            } catch (err) {
                console.error('Error accessing microphone:', err);
                statusText.textContent = 'Microphone access denied';
            }
        } else {
            // Stop recording
            mediaRecorder.stop();
            isRecording = false;
            recordButton.classList.remove('recording-animation');
            statusText.textContent = 'Processing...';
        }
    });
    

    //this is where the frontend records the audio and sends it to the backend for processing
    async function processAudio(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'voice.webm');

            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const data = await response.json();
            const result = data.result || "No result";
            const isParkinsons = /parkinson/i.test(result);

            showResult(isParkinsons);
            statusText.textContent = 'Tap to record again';
        } catch (error) {
            console.error('Error sending audio:', error);
            statusText.textContent = 'Error connecting to backend';
        }
    }
    


    function showResult(isParkinsons) {
        resultContent.innerHTML = isParkinsons 
            ? '<span class="text-red-600">⚠️ Parkinson\'s Detected</span>' 
            : '<span class="text-green-600">✅ Healthy</span>';
        
        resultContainer.classList.remove('hidden');
        setTimeout(() => {
            resultContainer.classList.add('show');
        }, 10);
        
        statusText.textContent = 'Tap to record again';
    }
});