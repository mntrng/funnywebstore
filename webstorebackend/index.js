const { default: axios } = require('axios')
const { response } = require('express')
const { promisify } = require("util")
const cors = require('cors')

const productList = ['gloves', 'facemasks', 'beanies']
const baseProductURL = 'https://bad-api-assignment.reaktor.com/v2/products'
const baseAvailabilityURL = 'https://bad-api-assignment.reaktor.com/v2/availability'

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3001

app.listen(port)
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

const redis = require('redis'),
    redisClient = redis.createClient(process.env.REDIS_TLS_URL, {
        tls: {
            rejectUnauthorized: false
        }
    })

console.log("Server started on " + port)
redisClient.on('connect', () => {
    console.log('Redis client connected')
})

const getDB = promisify(redisClient.get).bind(redisClient)
const setDB = promisify(redisClient.set).bind(redisClient)

const dataArray = []
var   brands = new Set()

const fetchProductData = async () => {
    const productPromises = []
    for (let i = 0; i < productList.length; i++) {
        productPromises.push(axios.get(`${baseProductURL}/${productList[i]}`))
    }

    try {
        const response = await axios.all(productPromises)
        Object.values(response).forEach(obj => {
            dataArray.push(obj.data)
        });

        const productData = {
            gloves: response[0].data,
            facemasks: response[1].data,
            beanies: response[2].data
        }

        if (dataArray.length > 0) {
            await getBrands(dataArray)
        }

        while (brands.size > 0) {
            await prepareStockData(brands)
        }

        await setDB("products", JSON.stringify(productData))
    } catch (err) {
        console.log(err)
    }
}

fetchProductData()

const getBrands = async (pData) => {
    let brandsDB = []
    const result = await getDB("brands").catch(err => {console.log(err)})
    if (result) {
        brandsDB = JSON.parse(result)
        pData.forEach(e => {
            for (let i = 0; i < e.length; i++) {
                if (!brandsDB.includes(e[i].manufacturer)) {
                    brands.add(e[i].manufacturer)
                }
            }
        })
    }

    await setDB("brands", JSON.stringify(brandsDB.concat([...brands])))

    return new Promise(resolve => {
        resolve(brands)
    })
}

const prepareStockData = async (brands) => {
    let stockDataDB = []
    let stockArray = []
    let stockPromises = []

    const result = await getDB("stockdata").catch(err => {console.log(err)})
    if (result) {
        stockDataDB = JSON.parse(result)
    }

    brands.forEach(brand => {
        stockPromises.push(axios.get(`${baseAvailabilityURL}/${brand}`))
    })

    const response_ = await axios.all(stockPromises)
    response_.forEach(res => {
        if (checkResponse(res.data.response) && res.config.url) {
            stockArray.push(res.data.response)
            brands.delete(res.config.url.substring(55))
        }
    })

    await setDB("stockdata", JSON.stringify(stockDataDB.concat(stockArray.flat(1))))
}

const checkResponse = (response) => {
    if (typeof response === 'string') {
        return false
    }
    return true
}

app.get('/api/products', (_req, res) => {
    redisClient.get('products', (error, result) => {
        if (result) {
            res.status(200).send(JSON.parse(result))
        } else {
            res.status(404).json(error)
        }
    })
})

app.get('/api/availability', (_req, res) => {
    redisClient.get('stockdata', (error, result) => {
        if (result) {
            res.status(200).send(JSON.parse(result))
        } else {
            res.status(404).json(error)
        }
    })
})