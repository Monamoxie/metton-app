function previewProfilePhoto(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('.profile-photo-preview img').attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function getTz() {
    let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz ? tz : "UTC"
}