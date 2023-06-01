const cartItems = document.querySelector('.cart-button')
try { let temp = JSON.parse(atob(localStorage.getItem('cartB'))) } catch { localStorage.removeItem('cartB') }

let visited = localStorage.getItem("visited")
if (!visited) {
    localStorage.setItem('visited', "sdaisd")
    fetch('/visit', { method: 'POST' })
}

let allProducts = {}
async function handleIntersection(entries, observer) {
    console.log('obs')
    for (let entry of entries) {
        if (entry.intersectionRatio > 0) {
            let imgUrls = []
            for (let i = 0; i < allProducts[entry.target.id].imageElements.length; i++) {
                let el = allProducts[entry.target.id].imageElements[i]
                let s = await fetch(allProducts[entry.target.id].images[i])
                s = await s.json()
                imgUrls.push(s.url)
                el.src = s.url
            }
            entry.target.firstChild.firstChild.src = allProducts[entry.target.id].imageElements[0].src
            entry.target.firstChild.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.innerText = imgUrls
            observer.unobserve(entry.target);
        }
    };
};
const options = {
    rootMargin: '900px',
    threshold: 0.1
};
const observer = new IntersectionObserver(handleIntersection, options);

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 30; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function addArrowImage(le) {
    const image = le.firstChild
    const left = image.nextSibling
    const right = left.nextSibling
    left.classList.remove('hide')
    right.classList.remove('hide')
}

function hideArrowImage(le) {
    const image = le.firstChild
    const left = image.nextSibling
    const right = left.nextSibling
    left.classList.add('hide')
    right.classList.add('hide')
}

function handleLeftClick(left) {
    if (imageOpen || discOpen) return
    const imageDiv = left.parentElement
    let image = imageDiv.firstChild
    let images = imageDiv.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling
    images = images.innerText
    images = images.split(",")
    let src = image.src
    if (src.includes(window.location.host)) src = src.split(window.location.host)[1]
    let index = images.indexOf(src)
    let code = imageDiv.parentElement.id
    if (index > 0) {
        image.remove()
        let n = allProducts[code].imageElements[index - 1].cloneNode()
        imageDiv.prepend(n)
        n.addEventListener('click', () => { onImageClick(n) })
    } else {
        image.remove()
        let n = allProducts[code].imageElements[images.length - 1].cloneNode()
        imageDiv.prepend(n)
        n.addEventListener('click', () => { onImageClick(n) })
    }
}

function handleRightClick(right) {
    if (imageOpen || discOpen) return
    const imageDiv = right.parentElement
    let image = imageDiv.firstChild
    let images = imageDiv.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling
    images = images.innerText
    images = images.split(",")
    let src = image.src
    if (src.includes(window.location.host)) src = src.split(window.location.host)[1]
    let index = images.indexOf(src)
    let code = imageDiv.parentElement.id
    console.log(index)
    if (index + 1 != images.length) {
        image.remove()
        let n = allProducts[code].imageElements[index + 1].cloneNode()
        imageDiv.prepend(n)
        n.addEventListener('click', () => { onImageClick(n) })
    } else {
        image.remove()
        let n = allProducts[code].imageElements[0].cloneNode()
        imageDiv.prepend(n)
        n.addEventListener('click', () => { onImageClick(n) })
    }
}

function handleRemoveClick(remove) {
    let id = remove.parentElement.parentElement.id
    let product = document.getElementById(id)
    document.querySelector('.cart-button').removeChild(product)
    updCartB()
}

function onImageClick(im) {
    if (imageOpen || discOpen) return
    let image = new Image
    image.src = im.src
    let currImage = image
    currImage.addEventListener('load', load)
    function load() {
        if (image.naturalWidth > image.naturalHeight) {
            width = document.documentElement.clientWidth * (80 / 100)
            height = (image.naturalHeight / image.naturalWidth) * width
            if (height > document.documentElement.clientHeight) {
                height = document.documentElement.clientHeight * (85 / 100)
                width = (image.naturalWidth / image.naturalHeight) * height
            }
        } else {
            height = document.documentElement.clientHeight * (85 / 100)
            width = (image.naturalWidth / image.naturalHeight) * height
            if (width > document.documentElement.clientWidth) {
                width = document.documentElement.clientWidth * (80 / 100)
                height = (image.naturalHeight / image.naturalWidth) * width
            }
        }
        image.width = width
        image.height = height
        image.classList.add('bigImage')
        document.body.append(image)
        let close = new Image(30, 30)
        close.src = "https://i.ibb.co/71D7qCN/568140.png"
        close.classList.add('close')
        document.body.append(close)
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        close.style = `position: fixed; left: ${(width + ((document.documentElement.clientWidth - width) / 2)) - 15}px; top: ${(((window.innerHeight - height) / 2) + 15)}px;`
        imageOpen = true
        window.onscroll = function () {
            window.scrollTo(scrollLeft, scrollTop);
        };
        let images = im.parentElement.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.innerText.split(',')
        let inX = null
        let code = im.parentElement.parentElement.id
        function touchStartEvent(e) {
            inX = e.touches[0].clientX
        }
        let src = currImage.src
        if (src.includes(window.location.host)) src = src.split(window.location.host)[1]
        let nP = document.createElement('p')
        nP.classList.add('nP')
        nP.style = `position: fixed; right: ${(50 + ((document.documentElement.clientWidth - width) / 2)) - 15}px; top: ${(((window.innerHeight - height) / 2) - 13.5)}px;`
        nP.innerText = `${images.indexOf(src) + 1}/${images.length}`
        document.body.appendChild(nP)
        function touchMoveEvent(e) {
            if (inX === null) return
            currImage.remove()
            let newImage;
            let src = currImage.src
            if (src.includes(window.location.host)) src = src.split(window.location.host)[1]
            let index = images.indexOf(src)
            if (e.touches[0].clientX > inX) {
                if (index > 0) {
                    newImage = allProducts[code].imageElements[index - 1].cloneNode()
                } else {
                    newImage = allProducts[code].imageElements[images.length - 1].cloneNode()
                }
            } else {
                if (index + 1 != images.length) {
                    newImage = allProducts[code].imageElements[index + 1].cloneNode()
                } else {
                    newImage = allProducts[code].imageElements[0].cloneNode()
                }
            }
            src = newImage.src
            if (src.includes(window.location.host)) src = src.split(window.location.host)[1]
            index = images.indexOf(src)
            nP.innerText = `${index + 1}/${images.length}`
            inX = null
            close.insertAdjacentElement('beforebegin', newImage)
            currImage = newImage
            newImage.addEventListener('load', () => {
                let height, width
                if (newImage.naturalWidth > newImage.naturalHeight) {
                    width = document.documentElement.clientWidth * (80 / 100)
                    height = (newImage.naturalHeight / newImage.naturalWidth) * width
                    if (height > document.documentElement.clientHeight) {
                        height = document.documentElement.clientHeight * (85 / 100)
                        width = (newImage.naturalWidth / newImage.naturalHeight) * height
                    }
                } else {
                    height = document.documentElement.clientHeight * (85 / 100)
                    width = (newImage.naturalWidth / newImage.naturalHeight) * height
                    if (width > document.documentElement.clientWidth) {
                        width = document.documentElement.clientWidth * (80 / 100)
                        height = (newImage.naturalHeight / newImage.naturalWidth) * width
                    }
                }
                currImage.width = width
                currImage.height = height
                close.style = `position: fixed; left: ${(width + ((document.documentElement.clientWidth - width) / 2)) - 15}px; top: ${(((window.innerHeight - height) / 2) + 15)}px;`
                nP.style = `position: fixed; right: ${(50 + ((document.documentElement.clientWidth - width) / 2)) - 15}px; top: ${(((window.innerHeight - height) / 2) - 13.5)}px;`
            })
            newImage.classList.remove('images')
            newImage.classList.add('bigImage')
            newImage.addEventListener('touchstart', touchStartEvent, { passive: true })
            newImage.addEventListener('touchmove', touchMoveEvent, { passive: true })
        }
        image.addEventListener('touchstart', touchStartEvent, { passive: true })
        image.addEventListener('touchmove', touchMoveEvent, { passive: true })
        close.addEventListener('click', () => {
            window.onscroll = function () { };
            imageOpen = false
            currImage.remove()
            close.remove()
            nP.remove()
        })
        currImage.removeEventListener('load', load)
    }
}

function handleDiscClick(button) {
    discOpen = true
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    window.onscroll = function () {
        window.scrollTo(scrollLeft, scrollTop);
    };
    let discContainer = document.createElement('div')
    discContainer.classList.add('discContainer')
    let discInContainer = document.createElement('div')
    discInContainer.classList.add('discInContainer')
    const textarea = document.createElement('textarea')
    textarea.readOnly = true
    textarea.classList.add('textarea')
    let code = button.parentElement.parentElement.firstChild.innerText.split(' ')
    textarea.value = allProducts[code[code.length - 1]].description.replace(/\r?\n/g, '\n')
    discInContainer.appendChild(textarea)
    let closeDisc = new Image(30, 30)
    closeDisc.src = "https://i.ibb.co/71D7qCN/568140.png"
    closeDisc.classList.add('closeDisc')
    discInContainer.appendChild(closeDisc)
    closeDisc.addEventListener('click', () => {
        discOpen = false
        window.onscroll = function () { };
        closeDisc.remove()
        textarea.remove()
        discInContainer.remove()
        discContainer.remove()
    })
    discContainer.appendChild(discInContainer)
    document.body.appendChild(discContainer)
}

function handleAddButton(button){
    if (imageOpen || discOpen) return
    try {
        let properties = []
        let title = button.previousSibling.previousSibling.previousSibling.innerText
        properties.push(title)
        let description = allProducts[`${title.split(' ')[title.split(' ').length - 1]}`].description
        properties.push(description)
        let price = button.previousSibling.innerHTML
        properties.push(price)
        let images = allProducts[`${button.parentElement.parentElement.id}`].images
        properties.push(images)
        let color = button.nextSibling.value
        let size = button.nextSibling.nextSibling.nextSibling.value
        let remarks = button.nextSibling.nextSibling.nextSibling.nextSibling.value
        if (color == "" || size < 1 || size == '' || remarks.length > 100 || size > 1000 || color.length > 50) {
            throw (console.error())
        }
        button.nextSibling.value = ""
        button.nextSibling.nextSibling.nextSibling.value = ""
        button.nextSibling.nextSibling.nextSibling.nextSibling.value = ""
        properties.push(color)
        properties.push(size)
        let id = makeid()
        console.log(images)
        const ne = new cartItem(properties[0], id, properties[1], properties[2], "cart-button", properties[3], properties[4], properties[5], remarks)
        ne.build()
        allProducts[id] = ne
        observer.observe(document.querySelector(`#${id}`))
        updCartB()
        containers = document.querySelectorAll(`#${id} .container`)
        lefts = document.querySelectorAll(`#${id} .left`)
        rights = document.querySelectorAll(`#${id} .right`)
        images = document.querySelectorAll(`#${id} .images`)
        removes = document.querySelectorAll(`#${id} .Remove`)
        discButtons = document.querySelectorAll(`#${id} .discButton`)

        containers.forEach(le => {
            le.addEventListener("mouseover", () => { addArrowImage(le) })
            le.addEventListener("mouseleave", () => { hideArrowImage(le) })
        })

        lefts.forEach(left => {
            left.addEventListener("click", () => { handleLeftClick(left) })
        })

        rights.forEach(right => {
            right.addEventListener("click", () => { handleRightClick(right) })
        })

        removes.forEach(remove => {
            remove.addEventListener("click", () => { handleRemoveClick(remove) })
        })

        images.forEach(im => {
            im.addEventListener('click', () => { onImageClick(im) })
        })

        discButtons.forEach(button => {
            button.addEventListener('click', () => { handleDiscClick(button) })
        })
    } catch (e) {
        let color = button.nextSibling.value
        let size = button.nextSibling.nextSibling.nextSibling.value
        if (button.nextSibling.nextSibling.nextSibling.nextSibling.value.length > 99) {
            alert("You can only add 100 characters in additional info")
        } else if (color == '' || size > 999) {
            alert('You have to add a color and make sure the size is less than 999')
        } else {
            alert("Please enter the size and color")
        }
        console.log(e)
    }
}

const pro = document.querySelectorAll('.product')
const buttons = document.querySelectorAll('.nav-button')
let imageOpen = false
let discOpen = false

let selected = "";

async function search() {
    let search = encodeURI(document.querySelector('.search').value.toLowerCase())
    console.log(search)
    if (!search) return
    let res = await fetch(`/search?search=${search}`)
    let products = await res.json()
    Array.from(document.querySelectorAll('.product.searching .card')).forEach(p => {
        p.remove()
    })
    products.forEach(p => {
        let node = document.querySelector(`#${p}`).cloneNode(deep = true)

        node.querySelector(`.container`).addEventListener("mouseover", () => { addArrowImage(node.querySelector(`.container`)) })
        node.querySelector(`.container`).addEventListener("mouseleave", () => { hideArrowImage(node.querySelector(`.container`)) })
        node.querySelector(`.left`).addEventListener("click", () => { handleLeftClick(node.querySelector(`.left`)) })
        node.querySelector(`.right`).addEventListener("click", () => { handleRightClick(node.querySelector(`.right`)) })
        node.querySelector(`.images`).addEventListener('click', () => { onImageClick(node.querySelector(`.images`)) })
        node.querySelector(`.discButton`).addEventListener('click', () => { handleDiscClick(node.querySelector(`.discButton`)) })
        node.querySelector(`.Add`).addEventListener('click', () => { handleAddButton(node.querySelector('.Add')) })
        observer.observe(node)
        document.querySelector('.product.searching').appendChild(node)
    })
    Array.from(document.querySelectorAll('.product')).forEach(p => {
        console.log(p.id)
        if (p.id == 'searching') {
            p.classList.remove('hide')
        } else {
            selected = p.id
            p.classList.add('hide')
        }
    })
}

document.querySelector('#searchform').addEventListener('submit', e => {
    e.preventDefault()
    search()
})

pro.forEach(product => {
    if (product.id == "ladies-stitched-suits") {
        buttons.forEach(button => {
            if (button.id == product.id) {
                button.style = "color:black; border-bottom: 2px solid black;"
            }
        })
        product.classList.remove('hide')
        selected = product.id
    } else {
        product.classList.add('hide')
    }
})

buttons.forEach(button => {
    button.addEventListener("mouseover", () => {
        if (imageOpen || discOpen) return
        let color = button.id == 'cart-button' ? 'rgb(157, 68, 223)' : 'black'
        button.style = `color:${color}; border-bottom: 2px solid ${color};`
    })
    button.addEventListener("mouseleave", () => {
        if (imageOpen || discOpen) return
        if (selected != button.id) {
            color = button.id == 'cart-button' ? 'rgb(157, 68, 223)' : 'gray'
            button.style = `border-bottom: 2px solid ${color}; color: ${color};`
        }
    })
    button.addEventListener("click", () => {
        if (imageOpen || discOpen) return
        pro.forEach(product => {
            let prod = button.id
            selected = prod
            if (product.id == prod) {
                product.classList.remove('hide')
                let color = prod == 'cart-button' ? 'rgb(157, 68, 223)' : 'black'
                button.style = `color:${color}; border-bottom: 2px solid ${color};`
            } else {
                buttons.forEach(button1 => {
                    if (button1.id != prod) {
                        color = button1.id == 'cart-button' ? 'rgb(157, 68, 223)' : 'gray'
                        button1.style = `border-bottom: 2px solid ${color}; color: ${color};`
                    }
                })
                product.classList.add('hide')
            }
        })
    })
})

function updCartB() {
    let elms = document.querySelectorAll('.product.cart-button .card')
    let details = []
    elms.forEach(elm => {
        let id = elm.id
        let title = document.querySelector(`#${id} .card2 .title`).innerHTML
        let code = title.split(' ')[title.split(' ').length - 1]
        let name = title.split(' ').slice(0, title.split(' ').length - 1).join(' ')
        let price = document.querySelector(`#${id} .card2 .amount`).innerHTML
        let color = document.querySelector(`#${id} .card2`).firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.innerText.split(' ')[1].split('\nSize:')[0]
        let size = document.querySelector(`#${id} .card2`).firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.innerText.split(' ')[2]
        let remarks = document.querySelector(`#${id} .card2`).firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.value.split('Remarks: ')[1]
        details = [...details, (code), (name), (color), (price), (size), (remarks)]
    })
    document.querySelector('.cartNumber').innerText = (details.length) / 6
    localStorage.setItem('cartB', btoa(JSON.stringify(details)))
}

class Product {
    constructor(title, name, description, amount, type, images, sizes) {
        this.name = name
        this.description = description
        this.amount = amount
        this.type = type
        this.images = [...images]
        this.title = title
        this.sizes = sizes
        this.imageElements = []
    }

    build() {
        const product = document.createElement('div')
        product.classList.add('card')
        product.id = this.name
        document.querySelector(`.${this.type}`).append(product)

        let imageContainer = document.createElement('div')
        imageContainer.id = `img${this.name}`
        imageContainer.classList.add('container')
        imageContainer.style = "position: relative;"
        document.querySelector(`#${this.name}`).append(imageContainer)

        this.images.forEach(img => {
            let i = new Image(220, 300)
            i.classList.add('images')
            i.loading = "lazy"
            i.src = img
            this.imageElements.push(i)
        })

        let img = new Image(220, 300);
        img.src = this.images[0]
        img.loading = 'lazy'
        img.classList.add('images')
        document.querySelector(`#img${this.name}`).append(img)

        let imgl = new Image(25, 25);
        imgl.src = "https://i.ibb.co/P4SPFWN/59209.png"
        imgl.classList.add('left')
        imgl.classList.add('hide')
        imgl.style = "position: absolute; left: 5px; top: 45%;"
        document.querySelector(`#img${this.name}`).append(imgl)

        let imgr = new Image(25, 25);
        imgr.src = "https://i.ibb.co/P4SPFWN/59209.png"
        imgr.classList.add('right')
        imgr.classList.add('hide')
        imgr.style = "position: absolute; right: 5px; top: 45%;"
        document.querySelector(`#img${this.name}`).append(imgr)

        const nameD = document.createElement('div')
        nameD.id = `D${this.name}`
        nameD.classList.add('card2')
        document.querySelector(`#${this.name}`).append(nameD)

        const name1 = document.createElement('div')
        name1.innerText = this.title + "   " + this.name
        name1.classList.add('title')
        document.querySelector(`#D${this.name}`).append(name1)

        const disc = document.createElement('div')
        disc.id = `disc${this.name}`
        disc.classList.add("disc")
        document.querySelector(`#D${this.name}`).append(disc)

        const discButton = document.createElement('button')
        discButton.classList.add('discButton')
        discButton.innerText = 'Description'
        document.querySelector(`#disc${this.name}`).appendChild(discButton)

        const amount = document.createElement('div')
        amount.classList.add('amount')
        amount.innerText = this.amount + " " + "CAD"
        document.querySelector(`#D${this.name}`).append(amount)

        const cart = document.createElement('button')
        cart.style = "margin: 10px;"
        cart.innerText = "Add to cart"
        cart.classList.add("Add")
        cart.id = this.name
        document.querySelector(`#D${this.name}`).append(cart)

        const number = document.createElement('input')
        number.classList.add('color')
        number.placeholder = "Color"
        document.querySelector(`#D${this.name}`).append(number)

        const images = document.createElement('div')
        images.style = "display: none;"
        images.innerText = this.images
        document.querySelector(`#D${this.name}`).append(images)

        const Size = document.createElement('input')
        Size.classList.add('number')
        Size.classList.add('size')
        Size.placeholder = "Size"
        Size.type = "Number"
        document.querySelector(`#D${this.name}`).append(Size)

        const addInfo = document.createElement('textarea')
        addInfo.placeholder = "Remarks"
        addInfo.classList.add('add-info')
        document.querySelector(`#D${this.name}`).append(addInfo)

        const availSizes = document.createElement('p')
        if (this.sizes != "") {
            availSizes.innerText = 'Sizes: ' + this.sizes
        } else {
            availSizes.innerText = ""
        }
        availSizes.classList.add('availSizes')
        document.querySelector(`#D${this.name}`).append(availSizes)
    }
}

class cartItem {
    constructor(title, name, description, amount, type, images, color, size, remarks) {
        this.name = name
        this.description = description
        this.amount = amount
        this.type = type
        this.images = [...images]
        this.title = title
        this.color = color
        this.size = size
        this.remarks = remarks
        this.imageElements = []
    }

    build() {
        const product = document.createElement('div')
        product.classList.add('card')
        product.id = this.name
        document.querySelector(`.checkout`).insertAdjacentElement("beforebegin", product)

        let imageContainer = document.createElement('div')
        imageContainer.id = `img${this.name}`
        imageContainer.classList.add('container')
        imageContainer.style = "position: relative;"
        document.querySelector(`#${this.name}`).append(imageContainer)

        this.images.forEach(img => {
            let i = new Image(220, 300)
            i.classList.add('images')
            i.loading = "lazy"
            i.src = img
            this.imageElements.push(i)
        })

        let img = new Image(220, 300);
        img.src = this.images[0]
        img.loading = 'lazy'
        img.classList.add('images')
        document.querySelector(`#img${this.name}`).append(img)

        let imgl = new Image(25, 25);
        imgl.src = "https://i.ibb.co/P4SPFWN/59209.png"
        imgl.classList.add('left')
        imgl.classList.add('hide')
        imgl.style = "position: absolute; left: 5px; top: 45%;"
        document.querySelector(`#img${this.name}`).append(imgl)

        let imgr = new Image(25, 25);
        imgr.src = "https://i.ibb.co/P4SPFWN/59209.png"
        imgr.classList.add('right')
        imgr.classList.add('hide')
        imgr.style = "position: absolute; right: 5px; top: 45%;"
        document.querySelector(`#img${this.name}`).append(imgr)

        const nameD = document.createElement('div')
        nameD.id = `D${this.name}`
        nameD.classList.add('card2')
        document.querySelector(`#${this.name}`).append(nameD)

        const name1 = document.createElement('div')
        name1.innerHTML = this.title
        name1.classList.add('title')
        document.querySelector(`#D${this.name}`).append(name1)

        const disc = document.createElement('div')
        disc.id = `disc${this.name}`
        disc.classList.add("disc")
        document.querySelector(`#D${this.name}`).append(disc)

        const discButton = document.createElement('button')
        discButton.classList.add('discButton')
        discButton.innerText = 'Description'
        document.querySelector(`#disc${this.name}`).appendChild(discButton)

        const amount = document.createElement('div')
        amount.classList.add('amount')
        amount.innerText = this.amount
        document.querySelector(`#D${this.name}`).append(amount)

        const cart = document.createElement('button')
        cart.style = "margin: 10px; display: none;"
        cart.innerText = "Add to cart"
        cart.classList.add("Add")
        cart.id = this.name
        document.querySelector(`#D${this.name}`).append(cart)

        const number = document.createElement('input')
        number.classList.add('number')
        number.classList.add('hiden')
        number.placeholder = "No. of items"
        number.type = "number"
        document.querySelector(`#D${this.name}`).append(number)

        const images = document.createElement('div')
        images.style = "display: none;"
        images.innerText = this.images
        document.querySelector(`#D${this.name}`).append(images)

        const items = document.createElement('div')
        items.classList.add('colorOfItems')
        items.style = "margin: 10px;"
        items.innerText = `Color: ${this.color}
        Size: ${this.size}`
        document.querySelector(`#D${this.name}`).append(items)

        const remarks = document.createElement('textarea')
        remarks.classList.add('remarks')
        remarks.readOnly = true
        remarks.style = "margin: 10px;"
        remarks.innerText = `Remarks: ${this.remarks}`
        document.querySelector(`#D${this.name}`).append(remarks)

        const cart1 = document.createElement('button')
        cart1.style = "margin: 10px;"
        cart1.innerText = "Remove from cart"
        cart1.classList.add("Remove")
        cart1.id = this.name
        document.querySelector(`#D${this.name}`).append(cart1)
    }
}

async function getProducts() {
    let products = await fetch('/products')
    products = await products.json()
    return products
}

getProducts().then(async products => {
    let codes = []
    products.forEach(p => {
        let prod = new Product(p.Name, p.Code, p.Description, p.Price, p.Type, p.Images, p.Sizes ? p.Sizes : '')
        prod.build()
        allProducts[p.Code] = prod
        codes.push(p.Code)
        observer.observe(document.querySelector(`#${p.Code}`))
    })
    if (localStorage.getItem('cartB')) {
        let cartB = JSON.parse(atob(localStorage.getItem('cartB')))
        let cartProds = []
        for (let i = 0; i < cartB.length; i += 6) {
            cartProds.push([cartB[i], cartB[i + 1], cartB[i + 2], cartB[i + 3], cartB[i + 4], cartB[i + 5]])
        }
        cartProds.forEach(prod => {
            let code = prod[0]
            if (codes.includes(code)) {
                let item = allProducts[code]
                let id = makeid()
                let n = new cartItem(prod[1] + ' ' + prod[0], id, item.description, prod[3], item.type, item.images, prod[2], prod[4], prod[5])
                n.build()
                allProducts[id] = n
                observer.observe(document.querySelector(`#${id}`))
            }
        })
        updCartB()
    }
    let containers = document.querySelectorAll('.container')
    let lefts = document.querySelectorAll('.left')
    let rights = document.querySelectorAll('.right')
    let removes = document.querySelectorAll('.Remove')
    let images = document.querySelectorAll('.images')
    let discButtons = document.querySelectorAll('.discButton')

    containers.forEach(le => {
        le.addEventListener("mouseover", () => { addArrowImage(le) })
        le.addEventListener("mouseleave", () => { hideArrowImage(le) })
    })

    lefts.forEach(left => {
        left.addEventListener("click", () => { handleLeftClick(left) })
    })

    rights.forEach(right => {
        right.addEventListener("click", () => { handleRightClick(right) })
    })

    removes.forEach(remove => {
        remove.addEventListener("click", () => { handleRemoveClick(remove) })
    })

    images.forEach(im => {
        im.addEventListener('click', () => { onImageClick(im) })
    })

    discButtons.forEach(button => {
        button.addEventListener('click', () => { handleDiscClick(button) })
    })

    const addButtons = document.querySelectorAll('.Add')

    addButtons.forEach(button => {
        button.addEventListener("click", () => {handleAddButton(button)})
    })

    window.addEventListener("beforeunload", () => {
        updCartB()
    })
})