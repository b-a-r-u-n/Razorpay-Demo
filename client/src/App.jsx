import axios from "axios"
import { useState } from "react"

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

const userData = {
  user: { name: "Jon Snow" },
  products: { product: { productName: "Knife" }, quantity: 2 },
  shippingAddress: { fullName: "Jon Snow", phone: "1234567890", Address: "Winterfell", city: "Winterfell", state: "Westeros", postalCode: 12345 },
  subTotal: 399,
  tax: 38,
  shippingCharge: 99,
  totalAmount: 536
}


function App() {

  const [loading, setLoading] = useState(false);

  async function displayRazorpay() {

    if (loading)
      return;

    setLoading(true);

    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

      if (!res) {
        alert('Razropay failed to load!!')
        return
      }

      const orderData = await axios.post(`${import.meta.env.VITE_BASE_URL}/order/`, userData)
      // console.log(res);


      // const data = await fetch('http://localhost:1769/razorpay', {method: 'POST'}).then((t) => 
      //   t.json()
      // ) 

      const data = await axios.post(`${import.meta.env.VITE_BASE_URL}/payment/create-payment`, { orderId: orderData.data.data._id })


      // console.log(data.data.data.razorpayOrder.currency)


      const options = {
        "key": meta.env.VITE_BASE_RAZORPAY_API_KEY, // Enter the Key ID generated from the Dashboard
        "amount": data.data.data.razorpayOrder.amount, // Amount is in currency subunits. 
        "currency": data.data.data.razorpayOrder.currency,
        "name": "STYQLO",
        "description": "Test Transaction",
        "image": "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg",
        "order_id": data.data.data.razorpayOrder.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        // "callback_url": `${import.meta.env.VITE_BASE_URL}/payment/verify-payment`,
        "handler": async (response) => {
          const verify = await axios.post(`${import.meta.env.VITE_BASE_URL}/payment/verify-payment`, {
            orderId: orderData.data.data._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })

          console.log(verify);
          
        },
        "modal": {
          ondismiss() {
            console.log("User closed checkout.");
          }
        },
        "notes": {
          "address": "Razorpay Corporate Office"
        },
        "theme": {
          "color": "#4188FB"
        }
      };
      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        console.error(response.error);

        // alert(response.error.description);
      });

      paymentObject.open();
      console.log(paymentObject);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

  }

  return (
    <>
      <div
        className='h-screen w-full bg-purple-950 flex items-center justify-center'
      >
        <button
          className='bg-yellow-300 text-3xl rounded-lg px-5 py-2 cursor-pointer font-semibold'
          onClick={displayRazorpay}
          disabled={loading}
        >
          {
            loading ? "Processing" : "Pay Now"
          }
        </button>
      </div>
    </>
  )
}

export default App
