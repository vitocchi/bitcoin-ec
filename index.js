const express = require('express')
const bitcoin = require('bitcoinjs-lib')
const app = express()

app.get('/', (req, res) => res.json({
    message: 'hello world'
}))
app.get('/invoice', (req, res) => {
    return res.json({
        invoice: createNewInvoice(req.query.order_id, req.query.amount)
    })
})

app.listen(3000, () => console.log('Listening on port 3000...'))

// order_idとamountからインボイスを作成する
function createNewInvoice(order_id, amount) {
    const multiSigAddress = generateMultiSigAddress(order_id)
    return generateBIP21Invoice(multiSigAddress, amount)
}

// indexから作成した子拡張公開鍵と、外部の公開鍵とのマルチシグアドレスを作成する
function generateMultiSigAddress(pubkeyIndex) {
    const purchasePubkey = generatePurchasePubkey(pubkeyIndex)
    const foreignPubkey = bitcoin.ECPair.fromWIF('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy').publicKey //外部の公開鍵
    const pubkeys = [
        purchasePubkey,
        foreignPubkey
    ]
    return multiSigAddressFromKeys(pubkeys)
}

// アドレスと数量からインボイスを作成する
function generateBIP21Invoice(address, amount) {
    return 'bitcoin:' + address + '?amount=' + amount
}

// indexから子拡張公開鍵を作成する
function generatePurchasePubkey(pubkeyIndex) {
    // 親の拡張公開鍵のbase58エンコーディング
    const tpub = 'tpubD6NzVbkrYhZ4WPFuszbfRUpT4bM7YP9wt89dY5WGm2jXiB2wLGMsEu4hmKrFHXZiGAqSeDM2FaUFsEdujD39efXjwZrVDW5C5nggZunjX2d'
    return bitcoin.bip32.fromBase58(tpub, bitcoin.networks.testnet).derive(parseInt(pubkeyIndex)).publicKey
}

function multiSigAddressFromKeys(pubkeys) {
    // まずP2MSマルチシグのペイメントを作る
    const p2msPayment = bitcoin.payments.p2ms({
        network: bitcoin.networks.testnet,
        m: 2,
        pubkeys
    })

    // Segwitのペイメントにする
    const p2wshPayment = bitcoin.payments.p2wsh({
        network: bitcoin.networks.testnet,
        redeem: p2msPayment
    })

    // P2SH (locking scriptのデジタルハッシュ化したものをScriptPubkeyとする)に変換する
    const p2shPayment = bitcoin.payments.p2sh({
        network: bitcoin.networks.testnet,
        redeem: p2wshPayment
    })

    return p2shPayment.address
}