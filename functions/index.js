// Node 18 functions
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const stripe = require('stripe')(functions.config().stripe.secret);

exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  const {amount, currency='usd', uid} = data;
  if(!context.auth) throw new functions.https.HttpsError('unauthenticated','User must be signed in');
  const paymentIntent = await stripe.paymentIntents.create({amount, currency});
  return {clientSecret: paymentIntent.client_secret};
});

// webhook to fulfill credits on successful payment
exports.stripeWebhook = functions.https.onRequest(async(req,res)=>{
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook;
  let event;
  try{
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch(e){
    console.error(e); return res.status(400).send(`Webhook Error: ${e.message}`);
  }
  if(event.type==='payment_intent.succeeded'){
    const pi = event.data.object;
    // parse metadata for uid & credits
    const uid = pi.metadata.uid;
    const credits = parseInt(pi.metadata.credits || '0',10);
    if(uid && credits){
      const userRef = admin.firestore().collection('users').doc(uid);
      await userRef.update({credits: admin.firestore.FieldValue.increment(credits)});
    }
  }
  res.json({received:true});
});
