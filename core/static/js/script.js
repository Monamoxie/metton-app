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
    
})