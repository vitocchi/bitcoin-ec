const express = require('express')
const app = express()

app.get('/', (req, res) => res.json({
    message: 'hello world'
}))
app.get('/invoice', (req, res) => {
    return res.json({
        invoice: createNewInvoice(req.query.order_id, req.query.amount)
    })
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))

// order_idとamountからインボイスを作成する
function createNewInvoice(order_id, amount) {
    const multiSigAddress = generateMultiSigAddress(order_id)
    return generateBIP21Invoice(multiSigAddress, amount)
}

// indexから作成した子拡張公開鍵と、外部の公開鍵とのマルチシグアドレスを作成する
function generateMultiSigAddress(pubkeyIndex) {
    const purchasePubkey = generatePurchasePubkey(pubkeyIndex)
    const pubkeys = [
        purchasePubkey,
        "外部の公開鍵"
    ]
    return "2-of-2 マルチシグをp2shでラップしたアドレス"
}

// アドレスと数量からインボイスを作成する
function generateBIP21Invoice(address, amount) {
    return 'bitcoin:' + address + '?amount=' + amount
}

// indexから子拡張公開鍵を作成する
function generatePurchasePubkey(pubkeyIndex) {
    return 'addressExample'
}