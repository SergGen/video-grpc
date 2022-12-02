'use strict';
window.onload = () => {
    console.log('!!!!!!!!!!!');
    const form = document.querySelector('#form');
    const deleteFileBtn = document.querySelector('#delete_file');
    form.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const formData = new FormData(evt.target);
        fetch('load-media', {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            body: formData
        }).then(r => {
            console.log(r);
        });
    });
    deleteFileBtn.addEventListener('click', () => {
        fetch('load-media', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            body: JSON.stringify({ fileName: 'someFile.mp4' })
        }).then(r => {
            console.log(r);
        });
    });
};
