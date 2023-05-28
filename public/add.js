let inputfile = document.querySelector('.addimage');
inputfile.addEventListener('change', (e) => {
    Array.from(e.target.files).forEach((file, i) => {
        handleImageLoading(URL.createObjectURL(file), i)
    })
});

let bigImages = []

function handleImageLoading(src, i) {
    let canvas = document.createElement('canvas');
    let bigImage = document.createElement('canvas')
    let img = new Image;
    img.src = src
        canvas.height = 300
        canvas.width = 220
        bigImages.push(bigImage)
        let ctx = canvas.getContext('2d');
        document.querySelector('.canvases').append(canvas)

    img.onload = () => {
        console.log(i)
        let ctx2 = bigImages[i].getContext('2d')
        bigImages[i].height = img.naturalHeight
        bigImages[i].width = img.naturalWidth
        ctx2.drawImage(img, 0, 0, bigImage.width, bigImage.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
}

document.querySelector('.remove').addEventListener('click', () => {
    document.querySelector('.canvases').firstChild.remove()
    bigImages.shift()
})

let add = document.querySelector('.submit')
add.addEventListener('click', async () => {
    let name = document.querySelector('.name').value
    let price = document.querySelector('.price').value
    let description = document.querySelector('.Description').value
    let type = document.querySelector('.type').value
    let sizes = document.querySelector('.sizes').value
    if (!name || !price || price < 1 || !description || !type || bigImages.length == 0 || type == 'choose' || !sizes) {
        console.log(name, price, description, type, images, !name, !price, price < 1, !description, !type, images.length == 0, type == 'choose')
        return
    }
    let suc = document.createElement('p')
    suc.innerText = 'Loading...'
    suc.style = `color: red; font-weight: bold; font-size: 30px;`
    document.querySelector('.add').appendChild(suc)
    let images = []
    for (let canvas of bigImages) {
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
        images.push(jso.url)
    }
    let urlencoded = new URLSearchParams();
    urlencoded.append("Name", name);
    urlencoded.append("Price", price);
    urlencoded.append("Description", description);
    urlencoded.append("Type", type);
    urlencoded.append("Images", images);
    urlencoded.append("Sizes", sizes);

    var requestOptions = {
        method: 'POST',
        body: urlencoded,
    };

    fetch("/add", requestOptions)

    document.querySelector('.name').value = ""
    document.querySelector('.price').value = ""
    document.querySelector('.Description').value = ""
    document.querySelector('.canvases').innerHTML = ""
    document.querySelector('.sizes').value = ""
    suc.innerText = 'Successfully added'
})