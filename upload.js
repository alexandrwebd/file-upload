//функция трансформирует размер изображения с байт в нормальный размер
function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (!bytes) {
        return '0 Byte';
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

//функция создает HTML элементы
    const element = (tag, classes = [], content) => {
    const node = document.createElement(tag)

        if(classes.length) {
            node.classList.add(...classes)
        }

        if(content) {
            node.textContent = content
        }

        return node
}

function noop () {

}

export function upload(selector, options = {}) {
    // глобальная переменная для файлов
    let files = []

    // функция загрузки файлов на сервер
    const onUpload = options.onUpload ?? noop

 //   получаю инпут
 const input = document.querySelector(selector)

    //создаю button, добавляю класс, добавляю контент
    const  open = element('button', ['btn'], 'Открыть')
    //создаю блок для картинок preivew
    const preview = element('div', ['preview'])
    const upload = element('button', ['btn', 'primary'], 'Загрузить')

    // если файлов еще нету, скрываем кнопку
    upload.style.display = 'none'


//    возможность добавления нескольких картинок
    if(options.multi) {
        input.setAttribute('multiple', true)
    }

//    добавляем возможность выбирать тип загружаеммых файлов, проверяем на true и наличие массива
    if(options.accept && Array.isArray(options.accept)) {
        input.setAttribute('accept', options.accept.join(','))
    }

//    вставляем еллемент после конца (не путать с insertAdjacentHtml)
    input.insertAdjacentElement("afterend", preview)
    input.insertAdjacentElement("afterend", upload)
    input.insertAdjacentElement("afterend", open)

//    обрабатываем входящие файлы которые выбрали
    const changeHanddler = event => {
        // выхожу с функции если ничего не выбрал
        if(!event.target.files.length){
            return
        }

        //получаю входящие файлы и привожу их к массиву Array.from
        files = Array.from(event.target.files)

        //очищаю блок с превью от предыдущих загрузок
        preview.innerHTML = ''
        upload.style.display = 'inline'
        //прохожу цыклом, проверяю регуляркой на соответствие типу image
        files.forEach(file => {
            if(!file.type.match('image')) {
                return
            }

        //    создаю превью файла, reader асинхронный поетому сначала добавляю обработчик события потом считываю reader
            const reader = new FileReader()

            reader.onload = ev => {
                //картинка в формате base 64
                const src = ev.target.result

                preview.insertAdjacentHTML('afterbegin', `
                    <div class="preview-image">
                    <div class="preview-remove" data-name="${file.name}">&times;</div>
                        <img src="${src}" alt="${file.name}" />
                        <div class="preview-info">
                            <span>${file.name}</span>
                            ${bytesToSize(file.size)}
                        </div>
                    </div>
                `)
            }

            reader.readAsDataURL(file)
        })

    }



// добавляю прослушку на ввесь блок с картинками и с помощью делегирования отслеживаю клик по крестику и получаю имя с dataset изображения
    const removeHandler = event => {
        if(!event.target.dataset.name){
            return
        }
        //имя файла при клике по крестику
        const {name} = event.target.dataset

        //удаляю превью из памяти изменяя массив с файлами
        files = files.filter( file => file.name !== name)

        //если все удалил скрываю кнопку загрузки
        if(!files.length) {
            upload.style.display = 'none'
        }
        //удаляю сам файл превью
        const block = preview
            .querySelector(`[data-name="${name}"]`)
            // удаляю ближащий блок с класом preview-image
            .closest('.preview-image')

        //добавляю анимацию при удалении
        block.classList.add('removing')
        setTimeout(() => block.remove(), 300)

    }

    //функция добавляет элемент прогресса
    const clearPreview = el => {
        el.style.bottom = '0px'
        el.innerHTML = '<div class="preview-info-progress"></div>'
    }

    const uploadHandler = () => {
        //блокирую возможность удалять файл
        preview.querySelectorAll('.preview-remove').forEach(el => el.remove())

        //очищаю блок инфо для прогресса загрузки
        const previewInfo = preview.querySelectorAll('.preview-info')
        previewInfo.forEach(clearPreview)
        onUpload(files, previewInfo)
    }

    //    делаю тригер клика по инпуту при клике на кнопку
    const triggerInput = () => input.click()

    open.addEventListener('click', triggerInput)
    input.addEventListener('change', changeHanddler)
    preview.addEventListener('click', removeHandler)
    upload.addEventListener('click', uploadHandler)
}