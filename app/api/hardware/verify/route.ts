import { NextResponse } from 'next/server'
import { createWorker } from 'tesseract.js'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File
    if (!imageFile) return NextResponse.json({ authorized: false, error: 'No image provided' }, { status: 400 })
    
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    
    // Run OCR locally using Tesseract.js
    const worker = await createWorker('eng')
    const { data: { text } } = await worker.recognize(buffer)
    await worker.terminate()
    
    // Clean the extracted text to only allow alphanumeric characters, making matching easier
    const detectedPlate = text.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    
    if (!detectedPlate) {
       return NextResponse.json({ authorized: false, message: 'No plate detected' }, { status: 400 })
    }

    // Check if there is an active booking matching this plate
    // We normalize the DB plate (removing hyphens/spaces) for comparison
    const bookings = await sql`
      SELECT b.*, s.zone 
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE REPLACE(REPLACE(UPPER(b.vehicle_number), '-', ''), ' ', '') = ${detectedPlate}
      AND b.status = 'active'
    `
    
    if (bookings.length > 0) {
      // Authorized - Gate Open
      // ESP32 will parse this and trigger the servo
      return NextResponse.json({ 
        authorized: true, 
        plate: detectedPlate, 
        message: 'Gate Opened',
        action: 'SERVO_OPEN'
      })
    } else {
      // Not Authorized - Gate Closed
      // Store alert in DB with base64 snippet of image
      const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`
      await sql`
        INSERT INTO alerts (title, message, type, "read", image_url)
        VALUES ('Unauthorized Entry Attempt', 'Vehicle plate detected: ' || ${detectedPlate}, 'security', false, ${base64Image})
      `
      return NextResponse.json({ 
        authorized: false, 
        plate: detectedPlate, 
        message: 'Access Denied',
        action: 'SERVO_LOCK'
      }, { status: 403 })
    }
  } catch (err) {
    console.error('Hardware verify error:', err)
    return NextResponse.json({ authorized: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
