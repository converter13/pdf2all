function convertToPDF() {
    let input = document.getElementById('fileInput').files;
    if (input.length === 0) {
        alert("Please select a file!");
        return;
    }

    let doc = new jsPDF();
    for (let i = 0; i < input.length; i++) {
        let file = input[i];
        let reader = new FileReader();
        
        reader.onload = function(e) {
            let img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                doc.addImage(img, 'JPEG', 10, 10, 180, 160);
                if (i < input.length - 1) doc.addPage();
                else doc.save('converted.pdf');
            };
        };
        reader.readAsDataURL(file);
    }
}
