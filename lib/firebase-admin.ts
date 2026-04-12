import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  try {
    // Only initialize if we have the required credentials
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle properly formatted private keys with newlines from Vercel env
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      })
      console.log('Firebase Admin initialized successfully')
    } else {
      console.warn('Firebase Admin not initialized: Missing environment variables.')
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error)
  }
}

const storage = admin.apps.length > 0 ? admin.storage() : null
const bucket = storage ? storage.bucket() : null

export { admin, bucket }
