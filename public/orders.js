async function getOrders(){
    let res = await fetch('/orders')
    res = await res.json()
    return res
}

async function getVisited(){
    let res = await fetch('/visit')
    res = await res.json()
    return res
}

let imageOpen = false

getOrders().then(orders => {
    orders.forEach(order => {
        let orderDiv = document.createElement('div')
        orderDiv.classList.add('order')

        let topDiv = document.createElement('div')
        topDiv.classList.add('top')

        let removeButton = document.createElement('button')
        removeButton.innerText = 'Remove order'
        removeButton.classList.add('remove')
        topDiv.appendChild(removeButton)

        let nameP = document.createElement('p')
        nameP.innerText = order.Name
        nameP.classList.add('info')
        topDiv.appendChild(nameP)

        let numberP = document.createElement('p')
        numberP.innerText = order.Number
        numberP.classList.add('info')
        topDiv.appendChild(numberP)

        let whatsapp = document.createElement('p')
        whatsapp.innerText = order.Whatsapp
        whatsapp.classList.add('info')
        topDiv.appendChild(whatsapp)

        let orderNoP = document.createElement('p')
        orderNoP.innerText = order.OrderNo
        orderNoP.classList.add('info')
        topDiv.appendChild(orderNoP)
        
        let expandButton = document.createElement('button')
        expandButton.innerText = 'Expand'
        expandButton.classList.add('expand')
        topDiv.appendChild(expandButton)

        removeButton.addEventListener('click', () => {
            let urlencoded = new URLSearchParams();
            urlencoded.append("orderno", `${order.OrderNo}`);
            var requestOptions = {
                method: 'DELETE',
                body: urlencoded,
            };
            fetch('/order', requestOptions)
            orderDiv.remove()
        })

        orderDiv.appendChild(topDiv)

        let items = document.createElement('div')
        items.classList.add('hide')
        items.classList.add('items')

        expandButton.addEventListener('click', () => {
            if(expandButton.innerText == 'Expand'){
                items.classList.remove('hide')
                expandButton.innerText = 'Retract'
            } else {
                items.classList.add('hide')
                expandButton.innerText = 'Expand'
            }
        })

       for(let item of order.Items) {
            const product = document.createElement('div')
            product.classList.add('card')
            product.id = item.Code
            items.appendChild(product)

            let imageContainer = document.createElement('div')
            imageContainer.id = `img${item.Code}`
            imageContainer.classList.add('container')
            imageContainer.style = "position: relative;"
            product.append(imageContainer)

            let img = new Image;
            img.src = item.Images[0]
            img.loading = 'lazy'
            img.classList.add('images')
            imageContainer.append(img)

            let imgl = new Image(25, 25);
            imgl.src = "https://i.ibb.co/P4SPFWN/59209.png"
            imgl.classList.add('left')
            imgl.classList.add('hide')
            imgl.style = "position: absolute; left: 5px; top: 45%;"
            imageContainer.append(imgl)

            let imgr = new Image(25, 25);
            imgr.src = "https://i.ibb.co/P4SPFWN/59209.png"
            imgr.classList.add('right')
            imgr.classList.add('hide')
            imgr.style = "position: absolute; right: 5px; top: 45%;"
            imageContainer.append(imgr)

            const nameD = document.createElement('div')
            nameD.id = `D${item.Code}`
            nameD.classList.add('card2')
            product.append(nameD)

            const name1 = document.createElement('div')
            name1.innerText = item.Name + "   " + item.Code
            name1.classList.add('title')
            nameD.append(name1)

            const disc = document.createElement('div')
            disc.id = `disc${item.Code}`
            disc.classList.add("disc")
            nameD.append(disc)

            const textarea = document.createElement('textarea')
            textarea.readOnly = true
            textarea.classList.add('textarea')
            textarea.innerText = item.Description
            nameD.append(textarea)
            
            const images = document.createElement('div')
            images.style = "display: none;"
            images.innerText = item.Images
            nameD.append(images)

            const amount = document.createElement('div')
            amount.classList.add('amount')
            amount.innerText = item.Price + " " + "CAD"
            nameD.append(amount)

            const nOfitems = document.createElement('div')
            nOfitems.classList.add('numberOfItems')
            nOfitems.style = "margin: 10px;"
            nOfitems.innerText = `Number of products: ${item.Quantity} 
            Size: ${item.Size}`
            nameD.append(nOfitems)

            const remarks = document.createElement('textarea')
            remarks.classList.add('remarks')
            remarks.style = "margin: 10px;"
            remarks.readOnly = true
            remarks.value = `Remarks: ${item.Remarks}`
            nameD.append(remarks)
        }

        orderDiv.appendChild(items)

        document.querySelector('.orders').append(orderDiv)
    })

    let containers = document.querySelectorAll('.container')
    let lefts = document.querySelectorAll('.left')
    let rights = document.querySelectorAll('.right')
    let removes = document.querySelectorAll('.Remove')
    let images = document.querySelectorAll('.images')

    containers.forEach(le => {
        le.addEventListener("mouseover", () => {
            const image = le.firstChild
            const left = image.nextSibling
            const right = left.nextSibling
            left.classList.remove('hide')
            right.classList.remove('hide')
        })
        le.addEventListener("mouseleave", () => {
            const image = le.firstChild
            const left = image.nextSibling
            const right = left.nextSibling
            left.classList.add('hide')
            right.classList.add('hide')
        })
    })

    lefts.forEach(left => {
        left.addEventListener("click", () => {
            if (imageOpen) return
            console.log('s')
            const imageDiv = left.parentElement
            let image = imageDiv.firstChild
            let images = imageDiv.nextSibling.firstChild.nextSibling.nextSibling.nextSibling
            images = images.innerText
            images = images.split(",")
            let src = image.src
            let index = images.indexOf(src)
            console.log(index)
            if (index > 0) {
                image.src = images[index - 1]
            } else {
                image.src = images[images.length - 1]
            }
        })
    })

    rights.forEach(right => {
        right.addEventListener("click", () => {
            if (imageOpen) return
            const imageDiv = right.parentElement
            let image = imageDiv.firstChild
            let images = imageDiv.nextSibling.firstChild.nextSibling.nextSibling.nextSibling
            images = images.innerText
            images = images.split(",")
            let src = image.src
            let index = images.indexOf(src)
            console.log(index)
            if (index + 1 != images.length) {
                image.src = images[index + 1]
            } else {
                image.src = images[0]
            }
        })
    })

    removes.forEach(remove => {
        remove.addEventListener("click", () => {
            let id = remove.parentElement.parentElement.id
            let product = document.getElementById(id)
            document.querySelector('.cart-button').removeChild(product)
        })
    })

    images.forEach(im => {
        im.addEventListener('click', () => {
            if (imageOpen) return
            let image = new Image(700, 800)
            image.src = im.src
            image.classList.add('bigImage')
            document.body.append(image)
            let close = new Image(30, 30)
            close.src = "https://i.ibb.co/71D7qCN/568140.png"
            close.classList.add('close')
            document.body.append(close)
            imageOpen = true
            let images = im.parentElement.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.innerText.split(',')
            let inX = null
            image.addEventListener('touchstart', e => inX = e.touches[0].clientX)
            image.addEventListener('touchmove', e => {
                if(inX === null) return
                if(e.touches[0].clientX > inX){
                    let index = images.indexOf(image.src)
                    if (index > 0) {
                        image.src = images[index - 1]
                    } else {
                        image.src = images[images.length - 1]
                    }
                    inX = null 
                } else {
                    let index = images.indexOf(image.src)
                    if (index + 1 != images.length) {
                        image.src = images[index + 1]
                    } else {
                        image.src = images[0]
                    } 
                    inX = null                  
                }
            })
            close.addEventListener('click', () => {
                imageOpen = false
                image.remove()
                close.remove()
            })
        })
    })
})

getVisited().then(v => {
    document.querySelector('.visited').innerText = `Visited ${v.visited} times`
})