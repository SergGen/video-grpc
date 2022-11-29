'use strict';
window.onload = () => {
    console.log('!!!!!!!!!!!');
    const form = document.querySelector('#form');
    form.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const formData = new FormData(evt.target);
        fetch('load-media', {
            method: 'POST',
            body: formData
        }).then(r => {
            console.log(r);
        })
    });
};
