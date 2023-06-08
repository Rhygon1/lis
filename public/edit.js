// document.querySelector('.submit').addEventListener('click', () => {
//     let code = document.querySelector('.code').value
//     if (code) {
//         let urlencoded = new URLSearchParams();
//         urlencoded.append("Code", code.toUpperCase());

//         var requestOptions = {
//             method: 'DELETE',
//             body: urlencoded,
//         };

//         fetch("/delete", requestOptions)
//         document.querySelector('.code').value = ''
//     }
// })

document.querySelector('.submit').addEventListener('click', async () => {
    let chosen = null;

    document.addEventListener('touchmove', e => {
        if (!chosen) return
        chosen.style = `
        position: absolute;
        left: ${e.touches[0].clientX - chosen.getBoundingClientRect().width / 2}px;
        top: ${e.touches[0].clientY - chosen.getBoundingClientRect().height / 2}px`
    })

    let code = document.querySelector('.code').value
    if (!code) return
    code = code.toUpperCase()
    let p = await fetch(`/product/${code}`)
    p = await p.json()
    if (p.Code == 'Not found') return

    let cont = document.createElement('div')
    cont.classList.add('cont')

    let title = document.createElement('p')
    title.classList.add('title')
    title.innerText = p.Name + ' ' + p.Code
    cont.appendChild(title)

    let l = document.createElement('label')
    l.innerText = 'Select more pictures: '
    l.style = 'margin-bottom: 10px;'
    let inputfile = document.createElement('input')
    inputfile.type = 'file'
    inputfile.name = 'file'
    inputfile.classList.add('file')
    inputfile.multiple = true
    l.appendChild(inputfile)
    cont.appendChild(l)

    function touchEndHandler(imgEl) {
        if (!chosen) return
        let images = Array.from(document.querySelectorAll('.img'))
        for (let imgElement of images) {
            let b = imgEl.getBoundingClientRect()
            console.log(b.top, b.left)
            let b1 = imgElement.getBoundingClientRect()
            if ((b.top + b.height / 2) > b1.top &&
                (b.top + b.height / 2) < b1.top + b1.height &&
                (b.left + b.width / 2) < b1.left + (b1.width / 2) &&
                (b.left + b.width / 2) > b1.left) {
                let newNode = imgEl.cloneNode()
                let index = Array.from(imgEl.parentElement.children).indexOf(imgEl)
                let indx2 = Array.from(imgEl.parentElement.children).indexOf(imgElement)
                indx2 -= index < indx2 ? 1 : 0
                let src = p.Images[index]
                p.Images.splice(index, 1)
                p.Images.splice(indx2, 0, src)
                imgElement.insertAdjacentElement('beforebegin', newNode)
                newNode.addEventListener('touchstart', () => chosen = newNode)
                newNode.addEventListener('touchend', () => { touchEndHandler(newNode) })
                newNode.style = ""
                imgEl.remove()
                console.log(p.Images)
                break
            } else if ((b.top + b.height / 2) > b1.top &&
                (b.top + b.height / 2) < b1.top + b1.height &&
                (b.left + b.width / 2) < b1.right &&
                (b.left + b.width / 2) > b1.right - (b1.width/2)) {
                let newNode = imgEl.cloneNode()
                let index = Array.from(imgEl.parentElement.children).indexOf(imgEl)
                let indx2 = Array.from(imgEl.parentElement.children).indexOf(imgElement) + 1
                indx2 -= index < indx2 ? 1 : 0
                let src = p.Images[index]
                p.Images.splice(index, 1)
                p.Images.splice(indx2, 0, src)
                imgElement.insertAdjacentElement('afterend', newNode)
                newNode.addEventListener('touchstart', () => chosen = newNode)
                newNode.addEventListener('touchend', () => { touchEndHandler(newNode) })
                newNode.style = ""
                imgEl.remove()
                console.log(p.Images)
                break
            }
        }
        imgEl.style = ""
        chosen = null
    }

    let removeImage = document.createElement('button')
    removeImage.classList.add('removeImage')
    removeImage.innerText = 'Remove Image'
    cont.appendChild(removeImage)

    let imgContainer = document.createElement('div')
    imgContainer.classList.add('imgCont')
    for (let img of p.Images) {
        let url = await fetch(img)
        url = await url.json()
        url = url.url
        let imgEl = document.createElement('img')
        imgEl.classList.add('img')
        imgEl.src = url
        imgContainer.appendChild(imgEl)

        imgEl.addEventListener('touchstart', () => chosen = imgEl)
        imgEl.addEventListener('touchend', () => { touchEndHandler(imgEl) })
    }
    cont.appendChild(imgContainer)

    let remove = document.createElement('button')
    remove.classList.add('remove')
    remove.innerText = 'Remove product'
    cont.appendChild(remove)
    document.querySelector('.main').appendChild(cont)


    let confirm = document.createElement('button')
    confirm.classList.add('confirm')
    confirm.innerText = 'Confirm'
    document.querySelector('.main').appendChild(confirm)


    remove.addEventListener('click', () => {
        let urlencoded = new URLSearchParams();
        urlencoded.append("Code", code);

        var requestOptions = {
            method: 'DELETE',
            body: urlencoded,
        };

        fetch("/delete", requestOptions)
        document.querySelector('.code').value = ''
        cont.remove()
        confirm.remove()
    })

    removeImage.addEventListener('click', () => {
        imgContainer.firstChild.remove()
        p.Images.shift()
        console.log(p.Images)
    })

    inputfile.addEventListener('change', (e) => {
        Array.from(e.target.files).forEach((file, i) => {
            handleImageLoading(URL.createObjectURL(file))
        })
    });

    async function handleImageLoading(src) {
        let canvas = document.createElement('canvas')
        let img = new Image;
        img.src = src

        img.onload = async () => {
            let ctx2 = canvas.getContext('2d')
            canvas.height = img.naturalHeight
            canvas.width = img.naturalWidth
            ctx2.drawImage(img, 0, 0, canvas.width, canvas.height)
            const base64ImageData = canvas.toDataURL('image/webp').replace(/^data:image\/webp;base64,/, '');
            const response = await fetch(`data:image/webp;base64,${base64ImageData}`);
            const arrayBuffer = await response.arrayBuffer();
            const u = new Uint8Array(arrayBuffer);
            const blob = new Blob([u], { type: 'image/webp' });
            const formData = new FormData();
            formData.append('image', blob, 'image.webp');
            let res = await fetch('/images', {
                method: 'POST',
                body: formData
            })
            let jso = await res.json()
            console.log(jso)
            p.Images.push(jso.url)

            let url = await fetch(jso.url)
            url = await url.json()
            url = url.url
            let imgEl = document.createElement('img')
            imgEl.classList.add('img')
            imgEl.src = url
            imgEl.addEventListener('touchstart', () => chosen = imgEl)
            imgEl.addEventListener('touchend', () => { touchEndHandler(imgEl) })
            imgContainer.appendChild(imgEl)
            console.log(p.Images)
        }
    }

    confirm.addEventListener('click', async () => {
        let urlencoded = new URLSearchParams(p);

        var requestOptions = {
            method: 'POST',
            body: urlencoded,
        };

        fetch("/update", requestOptions)
        document.querySelector('.code').value = ''
        cont.remove()
        confirm.remove()
    })
})

