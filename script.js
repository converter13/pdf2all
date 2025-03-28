const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const progressBar = document.getElementById('progressBar');
const conversionType = document.getElementById('conversionType');

let files = [];
let convertedFile = null;

// Drag & Drop Handlers
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-blue-500');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-blue-500');
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
});

// File Input Handler
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

async function handleFiles(newFiles) {
    files = [...newFiles];
    previewArea.innerHTML = '';
    
    for(const file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'file-preview';
            
            if(file.type.startsWith('image/')) {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <p class="text-center mt-2">${file.name}</p>
                `;
            } else {
                preview.innerHTML = `
                    <div class="text-center p-4">
                        <span class="text-4xl">📄</span>
                        <p class="mt-2">${file.name}</p>
                    </div>
                `;
            }
            
            previewArea.appendChild(preview);
        };
        
        if(file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    }
    
    convertBtn.classList.remove('hidden');
}

// Conversion Handlers
convertBtn.addEventListener('click', async () => {
    progressBar.classList.remove('hidden');
    const type = conversionType.value;
    
    try {
        switch(type) {
            case 'jpgToPdf':
                convertedFile = await convertImagesToPdf(files);
                break;
            case 'textToPdf':
                convertedFile = await convertTextToPdf(files);
                break;
            case 'pdfToJpg':
                convertedFile = await convertPdfToImages(files);
                break;
            case 'imageToText':
                convertedFile = await convertImageToText(files);
                break;
        }
        
        downloadBtn.classList.remove('hidden');
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(convertedFile);
            link.download = `converted.${convertedFile.type.split('/')[1]}`;
            link.click();
        };
    } catch(error) {
        alert(`Error: ${error.message}`);
    }
    
    progressBar.classList.add('hidden');
});

// Conversion Functions
async function convertImagesToPdf(files) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    files.forEach((file, index) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        doc.addImage(img, 'JPEG', 10, 10, 190, 0);
        if(index < files.length - 1) doc.addPage();
    });
    
    return new Blob([doc.output()], { type: 'application/pdf' });
}

async function convertTextToPdf(files) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const text = await files[0].text();
    
    doc.setFontSize(12);
    doc.text(text, 10, 10);
    return new Blob([doc.output()], { type: 'application/pdf' });
}

async function convertImageToText(files) {
    const worker = Tesseract.createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    const { data: { text } } = await worker.recognize(files[0]);
    await worker.terminate();
    
    return new Blob([text], { type: 'text/plain' });
}

// Theme Toggle
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Initialize Theme
if(localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}
