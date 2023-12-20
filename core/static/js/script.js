function previewProfilePhoto(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            const elem = document.getElementById("profile-photo-preview-img")
            elem.setAttribute("src", e.target.result)
        };
        reader.readAsDataURL(input.files[0]);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const clicky = document.getElementById("clicky")
    if (clicky) {
        clicky.addEventListener('click', event => {
            const copyText = document.getElementById("copyText");
            const clipboardAlert = document.getElementById("clipboardAlert")
            
            // copyText.select();
            // copyText.setSelectionRange(0, 99999); // For mobile devices
            
            navigator.clipboard.writeText(copyText.value);

            clipboardAlert.classList.remove('invisible')

            setTimeout(() => {
                clipboardAlert.classList.add('invisible')
            }, 1500);
        })
    }

    setAmPm = function (t) {
        const h = t.slice(0,2), m = t.slice(3,5)
        const ampm = h >= 12 ? 'pm' : 'am';
        let h_s = h % 12;
        h_s = h_s ? h_s : 12; 
        
        return h_s + ':' + m + ' ' + ampm;
    }
    
})