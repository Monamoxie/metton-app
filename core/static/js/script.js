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