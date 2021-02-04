import firebase from "firebase/app";
// импорт функции storage
import 'firebase/storage'
import {upload} from './upload.js'

// инициализация firebase
const firebaseConfig = {
    apiKey: "AIzaSyA46qaUPqYpbv_cXXlHiW8JEj7lk7AcdeQ",
    authDomain: "fe-upload-b86dc.firebaseapp.com",
    projectId: "fe-upload-b86dc",
    storageBucket: "fe-upload-b86dc.appspot.com",
    messagingSenderId: "508442418277",
    appId: "1:508442418277:web:19b08e1d1373c4e9c2ba8c"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// получаю функцию storage
const storage = firebase.storage()

upload('#file', {
    multi: true,
    accept: ['.png', '.jpg', '.jpeg', '.gif'],
    onUpload(files, blocks) {
        //загружаю файлы на firebase
        files.forEach((file, index) => {
            // получаю
           const ref = storage.ref(`images/${file.name}`)
            // сохраняю
           const task = ref.put(file)
            // прослушиваю
            task.on('state_changed', snapshot => {
                // выщитываю значение процентов для отображения загрузки, округляю его
                const percentage = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0) + '%'
                const block = blocks[index].querySelector('.preview-info-progress')
                block.textContent = percentage
                block.style.width = percentage
            }, error => {
                console.log(error)
            }, () => {
                // ссылка на картинку
                task.snapshot.ref.getDownloadURL().then(url => {
                    console.log('Download URL', url)
                })
            })
        })
    }
})