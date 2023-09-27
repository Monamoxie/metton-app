function previewProfilePhoto(input) {
    console.log('called')
    if (input.files && input.files[0]) {
        console.log('exists')
        var reader = new FileReader();
        reader.onload = function (e) {
            $('.profile-photo-preview img').attr('src', e.target.result);
        };
        console.log('read')
        reader.readAsDataURL(input.files[0]);
    }
}