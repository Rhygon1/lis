let orders = []
let order = []
let data = JSON.parse(localStorage.getItem('cartB'))
let total = 0
let ordered = false
data.forEach((p, i) => {
    let el;
    if((i + 1) % 6 != 0){
        el = document.createElement('p')
        el.classList.add('grid_item')
        el.innerText = p
    } else {
        el = document.createElement('textarea')
        el.readOnly = true
        el.classList.add('grid_item')
        el.innerText = p
    }
    document.querySelector('.grid').append(el)
    if ((i + 3) % 6 == 0) {
        console.log(Number(p.split(' ')[0]))
        total += Number(p.split(' ')[0])
        el.innerText = Number(p.split(' ')[0]) + " " + "CAD"
    }
    if ((i + 6) % 6 == 0 || (i + 4) % 6 == 0 || (i + 2) % 6 == 0) {
        order.push(p)
    }
    if ((i + 1) % 6 == 0) {
        order.push(p)
        orders.push(order)
        order = []
    }
    if ((i + 5) % 6 == 0 || (i + 6) % 6 == 0) {
        el.classList.add('left-align')
    }
})
let el = document.createElement('p')
el.classList.add('grid_item')
el.innerText = ''
document.querySelector('.grid').append(el)

el = document.createElement('p')
el.classList.add('grid_item')
el.classList.add('total')
el.innerText = ''
document.querySelector('.grid').append(el)

el = document.createElement('p')
el.classList.add('grid_item')
el.classList.add('total')
el.innerText = 'Total:'
document.querySelector('.grid').append(el)


el = document.createElement('p')
el.classList.add('grid_item')
el.innerText = total + ' ' + 'CAD'
document.querySelector('.grid').append(el)

var input = document.querySelector(".tel");
let iti = window.intlTelInput(input, {
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
});
console.log(iti)

var whatsapp = document.querySelector(".whatsapp");
let iti2 = window.intlTelInput(whatsapp, {
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
});

document.querySelector('.submit').addEventListener('click', async () => {
    if (ordered) return
    let number = iti.getNumber();
    let name = document.querySelector('.name').value
    let whatsapp = iti2.getNumber()
    if (name && iti.isValidNumber() && orders.length > 0 && (!whatsapp || iti2.isValidNumber())){
        let urlencoded = new URLSearchParams();
        urlencoded.append("Name", name);
        urlencoded.append("Number", number);
        if(!whatsapp){
            whatsapp = 'Whatsapp not provided'
        }
        urlencoded.append('Whatsapp', whatsapp)
        urlencoded.append("Items", JSON.stringify(orders));
        console.log(orders)
        var requestOptions = {
            method: 'POST',
            body: urlencoded,
        };

        let res = await fetch("/order", requestOptions)
        res = await res.json()
        res = res['orderno']
        if (res.length == 6) {
            ordered = true
            document.querySelector('.submit').remove()
            Array.from(document.querySelectorAll('.res')).forEach(el => el.remove())
            el = document.createElement('p')
            el.innerText = `Your order was successful!

            Order Number: ${res}`
            el.classList.add('res')
            document.querySelector('.form').append(el)
            document.querySelector('.links').classList.remove('hide')
        } else {
            Array.from(document.querySelectorAll('.res')).forEach(el => el.remove())
            el = document.createElement('p')
            el.innerText = `There was an error`
            el.classList.add('res')
            document.querySelector('.form').append(el)
        }

        document.querySelector('.name').value = ""
        input.value = ""
        whatsapp.value = ""
    } else if(!iti.isValidNumber()) {
        Array.from(document.querySelectorAll('.res')).forEach(el => el.remove())
        el = document.createElement('p')
        el.innerText = `There is an error in the phone number`
        el.classList.add('res')
        document.querySelector('.form').append(el)
    } else if(!name){
        Array.from(document.querySelectorAll('.res')).forEach(el => el.remove())
        el = document.createElement('p')
        el.innerText = `You have not inputed a name`
        el.classList.add('res')
        document.querySelector('.form').append(el)
    } else if(orders.length == 0){
        Array.from(document.querySelectorAll('.res')).forEach(el => el.remove())
        el = document.createElement('p')
        el.innerText = `You dont have enough orders`
        el.classList.add('res')
        document.querySelector('.form').append(el)
    } else if(whatsapp && !iti2.isValidNumber()){
        Array.from(document.querySelectorAll('.res')).forEach(el => el.remove())
        el = document.createElement('p')
        el.innerText = `Number in whatsapp field not valid`
        el.classList.add('res')
        document.querySelector('.form').append(el)
    }
})