function startConsult() {
    window.location.href = "consult.html";
}

function goBack() {
    window.location.href = "index.html";
}

function startVoice() {
    var recognition = new webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = function(event) {
        var text = event.results[0][0].transcript;

        document.getElementById("output").innerText = text;

        // 🔥 STORE SYMPTOMS HERE
        localStorage.setItem("symptoms", text.toLowerCase());

        // Show both options
        document.getElementById("doctorBtn").style.display = "block";
        document.getElementById("aiBtn").style.display = "block";
    };
}


function goToDoctor() {
    window.location.href = "doctor.html";
}

function consultAI() {

    document.getElementById("aiBtn").innerText = "AI is analyzing...";
    document.getElementById("aiBtn").disabled = true;

    setTimeout(function() {
        window.location.href = "prescription.html";
    }, 2000);
}

function loadHistory() {

    fetch("http://localhost:5000/doctor-history")
    .then(res => res.json())
    .then(data => {

        let html = "";

        if(data.length === 0){
            html = "<p>No history available</p>";
        }

        data.forEach(p => {
            html += `<p>${p.name} - ${p.symptom} → ${p.medication_suggested}</p>`;
        });

        document.getElementById("history").innerHTML = html;

    });
}

loadHistory();
