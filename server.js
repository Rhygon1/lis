const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const PORT = process.env.PORT || 3000
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require('crypto')
dotenv.config()
let visited = Number(fs.readFileSync(path.join(__dirname, '/visited.txt'), 'utf8'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const bucketName = process.env.BUCKET_NAME
const region = process.env.BUCKET_REGION
const accessKeyId = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_KEY

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
})

const schema = new mongoose.Schema({
    Name: String,
    Code: String,
    Description: String,
    Price: Number,
    Type: String,
    Images: [String],
    Disabled: Boolean,
    Sizes: String
})
const model = mongoose.model('Product', schema)

const orderSchema = new mongoose.Schema({
    Name: String,
    Number: String,
    OrderNo: String,
    Whatsapp: String,
    Items: [{
        Name: String,
        Code: String,
        Description: String,
        Price: Number,
        Color: String,
        Type: String,
        Images: [String],
        Size: Number,
        Remarks: String
    }],
    Disabled: Boolean
})
const orderModel = mongoose.model('Order', orderSchema)

mongoose.connect('mongodb+srv://Dhruv:gilbert130@cluster0.rcpc7.mongodb.net/Reselling?retryWrites=true&w=majority')
    .then(() => model.find({}).exec())
    .then(() => server.listen(PORT))

app.post('/visit', (req, res) => {
    visited += 1
    res.send('ok')
    console.log(visited)
    fs.writeFileSync(path.join(__dirname, '/visited.txt'), JSON.stringify(visited))
})

app.get('/visit', (req, res) => [
    res.send({ visited: visited })
])

app.get('/images/:name', async (req, res) => {
    // let response = await s3Client.send(new GetObjectCommand({
    //     Bucket: bucketName,
    //     Key: req.params.name
    // }))
    let url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
            Bucket: bucketName,
            Key: req.params.name
        }),
        {expiresIn: 300}
    )
    res.json({url: url})
})

app.post('/images', upload.single('image'), async (req, res) => {
    const fileName = generateFileName()
    const uploadParams = {
        Bucket: bucketName,
        Body: req.file.buffer,
        Key: fileName,
        ContentType: req.file.mimetype
    }

    await s3Client.send(new PutObjectCommand(uploadParams));

    res.json({ url: `/images/${fileName}` })
})

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, path.join('public', 'checkout.html')))
})

app.get('/products', (req, res) => {
    model.find({ Disabled: false }).exec()
        .then(d => res.json(d.reverse()))
})

app.get('/admin/add', (req, res) => {
    res.sendFile(path.join(__dirname, path.join('public', 'add.html')))
})

app.get('/admin/remove', (req, res) => {
    res.sendFile(path.join(__dirname, path.join('public', 'remove.html')))
})

app.get('/admin/orders', (req, res) => {
    res.sendFile(path.join(__dirname, path.join('public', 'orders.html')))
})

app.get('/orders', async (req, res) => {
    let orders = await orderModel.find({ Disabled: false })
    res.json(orders)
})

app.post('/add', (req, res, next) => {
    try {
        let assos = {
            'ladies-stitched-suits': "LS",
            'unstitched-suits': "US",
            'sarees': 'SR',
            'lehenga': 'LH',
            'indo-western': 'IW',
            'readymade-suits': 'RS'
        }
        model.count({ Type: req.body.Type })
            .then(a => {
                let l = JSON.stringify(a + 1)
                let adding = ''
                for (let i = 0; i < 5 - l.length; i++) {
                    adding += '0'
                }
                adding += l
                let n = {
                    Name: req.body.Name,
                    Code: `LIS-${assos[req.body.Type]}-${adding}`,
                    Description: req.body.Description,
                    Price: Number(req.body.Price),
                    Type: req.body.Type,
                    Images: req.body.Images.split(','),
                    Disabled: false,
                    Sizes: req.body.Sizes
                }
                model.create(n)
                    .then(console.log)
            })

    } catch (e) {
        return next(e)
    }
})

app.delete('/delete', (req, res) => {
    model.findOneAndUpdate({ Code: req.body.Code }, { Disabled: true })
        .then(console.log)
    res.send('ok')
})

app.post('/order', async (req, res, next) => {
    try {
        let all = await orderModel.count({})
        let name = req.body.Name
        let number = req.body.Number
        let whatsapp = req.body.Whatsapp
        let l = JSON.stringify(all + 1)
        let orderno = ''
        for (let i = 0; i < 6 - l.length; i++) {
            orderno += '0'
        }
        orderno += l
        let its = JSON.parse(req.body.Items)
        let orders = []
        for (let it of its) {
            let item = await model.findOne({ Code: it[0] })
            let order = {
                Name: item.Name,
                Code: item.Code,
                Description: item.Description,
                Price: item.Price,
                Color: it[1],
                Images: item.Images,
                Size: Number(it[2]),
                Remarks: it[3]
            }
            orders.push(order)
        }
        let order = {
            Name: name,
            Number: number,
            OrderNo: orderno,
            Whatsapp: whatsapp,
            Items: orders,
            Disabled: false
        }
        orderModel.create(order)
            .then(console.log)
            .then(res.json({ 'orderno': orderno }))
    } catch (e) {
        return next(e)
    }
})

app.delete('/order', (req, res) => {
    orderModel.findOneAndUpdate({ OrderNo: req.body.orderno }, { Disabled: true })
        .then(console.log)
    res.send('ok')
})

// let n = {
//     Name: 'fad',
//     Number: 'sdas',
//     OrderNo: 'sdhauhs',
//     Items: [
//         {
//             Name: "sarees",
//             Code: "as",
//             Description: `karigari by DKH K199 Premium cotton beautifully printed full flare anarkali paired up with lehriya dupatta with gotta lace detailing on suit.. Sizes 38 to 46*`,
//             Price: 1750,
//             Quanitity: 2,
//             Type: "sarees",
//             Images: ["https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?cs=srgb&dl=pexels-pixabay-268533.jpg&fm=jpg", "https://img.freepik.com/free-photo/landscape-with-night-starry-sky-silhouette-tree-hill-milky-way-with-lonely-tree-falling-stars_146671-14048.jpg?w=2000", "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D&w=1000&q=80"]
//         },
//         {
//             Name: "sarees",
//             Code: "as",
//             Description: `karigari by DKH K199 Premium cotton beautifully printed full flare anarkali paired up with lehriya dupatta with gotta lace detailing on suit.. Sizes 38 to 46*`,
//             Price: 1750,
//             Quanitity: 2,
//             Type: "sarees",
//             Images: ["https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?cs=srgb&dl=pexels-pixabay-268533.jpg&fm=jpg", "https://img.freepik.com/free-photo/landscape-with-night-starry-sky-silhouette-tree-hill-milky-way-with-lonely-tree-falling-stars_146671-14048.jpg?w=2000", "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D&w=1000&q=80"]
//         }
//     ]
// }
// order.create(n).then(console.log)
// model.deleteMany({}).then(console.log)
// let n = {
//     Name: "sarees",
//     Code: "as",
//     Description: `karigari by DKH K199 Premium cotton beautifully printed full flare anarkali paired up with lehriya dupatta with gotta lace detailing on suit.. Sizes 38 to 46*`,
//     Price: 1750,
//     Type: "sarees",
//     Images: ["https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?cs=srgb&dl=pexels-pixabay-268533.jpg&fm=jpg", "https://img.freepik.com/free-photo/landscape-with-night-starry-sky-silhouette-tree-hill-milky-way-with-lonely-tree-falling-stars_146671-14048.jpg?w=2000", "https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D&w=1000&q=80"]
// }
// model.create(n).then(console.log)

