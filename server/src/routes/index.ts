import express from 'express'
import Stripe from 'stripe'
import dotenv from 'dotenv'
const env = dotenv.config()
const STRIPE_SECRET_KEY: any = process.env.STRIPE_SECRET_KEY

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2020-08-27'})

import { log } from '#/logger'
import e from 'express'

const router = express.Router()

/*
 * Get home page
 */
router.get("/", function(req, res, next) {
    console.log("test")
})

router.post("/v1/order/payment", async function(req, res, next) {

    log.info("ルータメソッドの処理を開始します。リクエスト：", req.body)

    const { paymentMethodId, paymentIntentId, items, currency, useStripeSdk } = req.body

    let total = caculateAmount(req.body.items)
    try {
        let intent
        if (paymentMethodId) {
            interface request {
                amount: number,
                currency: string,
                payment_method: any,
                confirm: boolean,
                use_stripe_sdk: any
            }
            const request: request = {
                amount: total,
                currency: currency,
                payment_method: paymentMethodId,
                confirm: true,
                use_stripe_sdk: useStripeSdk
            }

            log.info("Stripe APIを呼び出します。リクエスト：", request)

            intent = await stripe.paymentIntents.create(request)

            log.info("Stripe APIを呼び出しました。レスポンス：", intent)
        } else if (paymentIntentId) {
            intent = await stripe.paymentIntents.confirm(paymentIntentId)
        }

        const response = generateResponse(intent)

        log.info("ルータメソッドの処理を終了します。レスポンス：", response)

        res.send(response);
    } catch(e) {
        log.error("ルータメソッドの処理中にエラーが発生しました。:", e)
        const response = generateErrorResponse(e.message)
        res.status(500)
        res.send(response)
    }
})

function caculateAmount(items: {name: string, amount: number, quantity: number}[]) {
    let total = 0
    for (let i = 0; i < items.length; i++) {
        const current = items[i].amount * items[i].quantity
        total += current
    }

    return total
}

function generateResponse(paymentIntent: any) {
    interface response {
        requiresAction: boolean,
        clientSecret: string,
        paymentIntentStatus: any,
        error: any
    }

    const response: response = {
        requiresAction: true,
        clientSecret: "",
        paymentIntentStatus: "",
        error: ""
    }

    if (paymentIntent !== undefined) {
        // 型 '"canceled" | "processing" | "requires_capture" | "requires_confirmation" | "requires_payment_method" | "succeeded"'
        if (paymentIntent.status === "requires_action") {
            response.paymentIntentStatus = "requires_action"
        } else if (paymentIntent.status === "canceled") {
            response.paymentIntentStatus = "canceled"
        } else if (paymentIntent.status === "requires_payment_method") {
            response.paymentIntentStatus = "requires_payment_method";
        } else if (paymentIntent.status === "succeeded") {
            response.paymentIntentStatus = "succeeded";
            response.clientSecret = <string>paymentIntent.client_secret;
        } else {
            response.error = {
                messages: ["システムエラーが発生しました"]
            }
        }
    }

    return response
}

function generateErrorResponse (error: any) {
    return {
        error: {
            messages: [error]
        }
    }
}

module.exports = router