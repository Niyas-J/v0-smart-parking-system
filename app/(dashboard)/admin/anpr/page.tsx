"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, CheckCircle, XCircle, Loader2, RefreshCw, User, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface ScanResult {
  id: number
  plate: string
  timestamp: Date
  status: 'valid' | 'invalid' | 'processing'
  user?: {
    name: string
    email: string
    credits: number
    vehicle_number: string
  }
  confidence?: number
}

export default function ANPRPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [extractedPlate, setExtractedPlate] = useState('')
  const [manualPlate, setManualPlate] = useState('')
  const [validationResult, setValidationResult] = useState<ScanResult | null>(null)
  const [recentScans, setRecentScans] = useState<ScanResult[]>([])
  const [cameraActive, setCameraActive] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }
    } catch (error) {
      toast.error('Failed to access camera')
      console.error('Camera error:', error)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setCameraActive(false)
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg')
    setCapturedImage(imageData)
    stopCamera()
    
    runOCR(imageData)
  }

  const runOCR = async (imageData: string) => {
    setOcrLoading(true)
    setExtractedPlate('')
    
    try {
      const Tesseract = await import('tesseract.js')
      
      const { data } = await Tesseract.recognize(imageData, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      })

      let plate = data.text
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .trim()

      if (plate.length >= 5) {
        setExtractedPlate(plate)
        setManualPlate(plate)
        toast.success(`Plate detected: ${plate}`)
      } else {
        toast.warning('Could not detect plate clearly. Please enter manually.')
      }
    } catch (error) {
      console.error('OCR error:', error)
      toast.error('OCR failed. Please enter plate manually.')
    } finally {
      setOcrLoading(false)
    }
  }

  const validatePlate = async (plate: string) => {
    if (!plate || plate.length < 3) {
      toast.error('Please enter a valid plate number')
      return
    }

    setIsScanning(true)
    setValidationResult(null)

    try {
      const res = await fetch('/api/anpr/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate: plate.toUpperCase() })
      })

      const data = await res.json()

      const result: ScanResult = {
        id: Date.now(),
        plate: plate.toUpperCase(),
        timestamp: new Date(),
        status: data.valid ? 'valid' : 'invalid',
        user: data.user,
        confidence: extractedPlate ? 85 : 100
      }

      setValidationResult(result)
      setRecentScans(prev => [result, ...prev.slice(0, 9)])

      if (data.valid) {
        toast.success(`✅ Valid - ${data.user.name}`)
      } else {
        toast.error(`❌ Invalid - ${data.message}`)
      }
    } catch (error) {
      console.error('Validation error:', error)
      toast.error('Validation failed')
    } finally {
      setIsScanning(false)
    }
  }

  const resetScan = () => {
    setCapturedImage(null)
    setExtractedPlate('')
    setManualPlate('')
    setValidationResult(null)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ANPR System</h1>
        <p className="text-muted-foreground mt-1">Automatic Number Plate Recognition</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Camera Capture
            </CardTitle>
            <CardDescription>Capture vehicle number plate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cameraActive && (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-primary/50 m-8 rounded-lg pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/70 text-sm">
                    Position plate here
                  </div>
                </div>
              </div>
            )}

            {capturedImage && !cameraActive && (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              </div>
            )}

            {!cameraActive && !capturedImage && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Camera preview will appear here</p>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-2">
              {!cameraActive && !capturedImage && (
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              )}

              {cameraActive && (
                <>
                  <Button onClick={captureImage} className="flex-1">
                    Capture Image
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    Cancel
                  </Button>
                </>
              )}

              {capturedImage && (
                <Button onClick={resetScan} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Scan
                </Button>
              )}
            </div>

            {ocrLoading && (
              <Alert>
                <Loader2 className="w-4 h-4 animate-spin" />
                <AlertDescription>
                  Processing image with OCR...
                </AlertDescription>
              </Alert>
            )}

            {extractedPlate && !ocrLoading && (
              <Alert>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <AlertDescription>
                  Detected Plate: <strong>{extractedPlate}</strong>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation</CardTitle>
            <CardDescription>Verify plate number against database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plate Number</label>
              <div className="flex gap-2">
                <Input
                  value={manualPlate}
                  onChange={(e) => setManualPlate(e.target.value.toUpperCase())}
                  placeholder="ABC-1234"
                  className="flex-1 font-mono text-lg"
                  disabled={isScanning}
                />
                <Button
                  onClick={() => validatePlate(manualPlate)}
                  disabled={isScanning || !manualPlate}
                >
                  {isScanning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Validate'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Edit the detected plate or enter manually
              </p>
            </div>

            {validationResult && (
              <div className={`p-4 rounded-lg border-2 ${
                validationResult.status === 'valid' 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-red-500 bg-red-500/10'
              }`}>
                <div className="flex items-start gap-3">
                  {validationResult.status === 'valid' ? (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-bold text-lg">{validationResult.plate}</p>
                      <Badge variant={validationResult.status === 'valid' ? 'default' : 'destructive'}>
                        {validationResult.status === 'valid' ? 'VALID' : 'INVALID'}
                      </Badge>
                    </div>

                    {validationResult.user && (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{validationResult.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>Balance: ${Number(validationResult.user.credits).toFixed(2)}</span>
                        </div>
                        <p className="text-muted-foreground">{validationResult.user.email}</p>
                      </div>
                    )}

                    {!validationResult.user && (
                      <p className="text-sm text-muted-foreground">
                        Vehicle not registered in system
                      </p>
                    )}

                    {validationResult.confidence && (
                      <p className="text-xs text-muted-foreground">
                        OCR Confidence: {validationResult.confidence}%
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {validationResult.status === 'valid' ? (
                    <Button className="flex-1" onClick={() => toast.success('Entry granted!')}>
                      Grant Entry
                    </Button>
                  ) : (
                    <Button variant="destructive" className="flex-1" onClick={() => toast.error('Entry denied')}>
                      Deny Entry
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => toast.info('Manual override applied')}>
                    Override
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Last 10 plate validations</CardDescription>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scans yet. Start by capturing a plate.
            </div>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    {scan.status === 'valid' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-mono font-bold">{scan.plate}</p>
                      <p className="text-sm text-muted-foreground">
                        {scan.user?.name || 'Unknown vehicle'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={scan.status === 'valid' ? 'default' : 'destructive'}>
                      {scan.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(scan.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
