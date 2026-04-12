'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Loader,
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei'
import * as THREE from 'three'
import type { Slot } from '@/lib/db'
import { cn } from '@/lib/utils'
import { inferParkingZone, type ParkingZone } from '@/lib/slot-zone'

type SlotRow = Slot & { zone?: string | null }

function isBooked(status: Slot['status']) {
  return status === 'occupied' || status === 'reserved'
}

function zoneScale(zone: ParkingZone) {
  if (zone === 'bike') return 0.42
  if (zone === 'suv') return 0.95
  return 0.62
}

function zoneCarColor(zone: ParkingZone): string {
  if (zone === 'bike') return '#22d3ee'
  if (zone === 'suv') return '#f97316'
  return '#60a5fa'
}

function SimpleCar({
  color,
  scale,
}: {
  color: string
  scale: number
}) {
  const body = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!body.current) return
    body.current.position.y = 0.12 + Math.sin(state.clock.elapsedTime * 1.2) * 0.012
  })

  return (
    <group ref={body} scale={scale} position={[0, 0.12, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[0.95, 0.28, 0.45]} />
        <meshStandardMaterial color={color} metalness={0.65} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0, 0.38, -0.02]}>
        <boxGeometry args={[0.55, 0.2, 0.38]} />
        <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.32, 0.08, 0.22]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.32, 0.08, 0.22]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.32, 0.08, -0.22]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.32, 0.08, -0.22]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

function ParkingSlot({
  slot,
  position,
  selected,
  onSelect,
}: {
  slot: SlotRow
  position: [number, number, number]
  selected: boolean
  onSelect: (s: SlotRow) => void
}) {
  const group = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const booked = isBooked(slot.status)
  const available = slot.status === 'available'
  const maintenance = slot.status === 'maintenance'
  const zone = inferParkingZone(slot)

  useFrame((state, dt) => {
    if (!group.current) return
    const target = selected ? 1.06 : 1
    group.current.scale.x = THREE.MathUtils.lerp(group.current.scale.x, target, 1 - Math.exp(-12 * dt))
    group.current.scale.y = THREE.MathUtils.lerp(group.current.scale.y, target, 1 - Math.exp(-12 * dt))
    group.current.scale.z = THREE.MathUtils.lerp(group.current.scale.z, target, 1 - Math.exp(-12 * dt))

    if (matRef.current && available) {
      const t = state.clock.elapsedTime
      matRef.current.emissiveIntensity = 0.55 + Math.sin(t * 2.4) * 0.18
    }
    if (matRef.current && booked) {
      const t = state.clock.elapsedTime
      matRef.current.emissiveIntensity = 0.35 + Math.sin(t * 1.8) * 0.08
    }
  })

  const color = useMemo(() => {
    if (maintenance) return '#64748b'
    if (booked) return '#ef4444'
    if (available) return '#10b981'
    return '#94a3b8'
  }, [available, booked, maintenance])

  const emissiveColor = useMemo(() => new THREE.Color(color), [color])

  const edgeGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.92, 0.06, 1.55)),
    [],
  )

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (!available) return
    onSelect(slot)
  }

  const handlePointer = (down: boolean) => {
    if (!available || !group.current) return
    document.body.style.cursor = down ? 'grabbing' : 'pointer'
  }

  return (
    <group ref={group} position={position}>
      <mesh
        receiveShadow
        castShadow
        onClick={handleClick}
        onPointerOver={() => available && (document.body.style.cursor = 'pointer')}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
        onPointerDown={() => handlePointer(true)}
        onPointerUp={() => handlePointer(false)}
      >
        <boxGeometry args={[0.92, 0.06, 1.55]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          metalness={0.35}
          roughness={0.35}
          emissive={emissiveColor}
          emissiveIntensity={available ? 0.55 : booked ? 0.35 : 0.05}
        />
      </mesh>

      {booked && (
        <SimpleCar color={zoneCarColor(zone)} scale={zoneScale(zone)} />
      )}

      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
          <ringGeometry args={[0.55, 0.62, 48]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.85}
            toneMapped={false}
          />
        </mesh>
      )}

      <lineSegments position={[0, 0.04, 0]} geometry={edgeGeo}>
        <lineBasicMaterial color="#e2e8f0" transparent opacity={0.35} />
      </lineSegments>
    </group>
  )
}

function Deck({
  slots,
  selectedId,
  onSelect,
}: {
  slots: SlotRow[]
  selectedId: number | null
  onSelect: (s: SlotRow) => void
}) {
  const cols = 10
  const gap = 1.22
  const rows = Math.max(1, Math.ceil(slots.length / cols))
  const originX = ((cols - 1) * gap) / 2
  const originZ = ((rows - 1) * gap) / 2

  return (
    <group>
      {slots.map((slot, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = col * gap - originX
        const z = row * gap - originZ
        return (
          <ParkingSlot
            key={slot.id}
            slot={slot}
            position={[x, 0, z]}
            selected={selectedId === slot.id}
            onSelect={onSelect}
          />
        )
      })}
    </group>
  )
}

function Scene({
  slots,
  selectedId,
  onSelect,
}: {
  slots: SlotRow[]
  selectedId: number | null
  onSelect: (s: SlotRow) => void
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[14, 11, 16]} fov={42} />
      <OrbitControls
        enablePan
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.05}
        maxDistance={38}
        minDistance={8}
        target={[0, 0, 0]}
      />
      <color attach="background" args={['#030712']} />
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[10, 18, 8]}
        intensity={1.35}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 8, -6]} intensity={0.6} color="#38bdf8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0b1220" metalness={0.2} roughness={0.85} />
      </mesh>
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
      <Deck slots={slots} selectedId={selectedId} onSelect={onSelect} />
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.45}
        scale={28}
        blur={2.4}
        far={9}
      />
    </>
  )
}

export function ParkingLot3D({
  slots,
  selectedSlot,
  onSelectSlot,
  className,
}: {
  slots: SlotRow[]
  selectedSlot: Slot | null
  onSelectSlot: (slot: SlotRow) => void
  className?: string
}) {
  const selectedId = selectedSlot?.id ?? null

  return (
    <div
      className={cn(
        'relative h-[min(520px,70vh)] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950/80 to-slate-900/40 shadow-[0_0_60px_-12px_rgba(56,189,248,0.35)]',
        className,
      )}
    >
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <Scene slots={slots} selectedId={selectedId} onSelect={onSelectSlot} />
      </Canvas>
      <Loader />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/90 to-transparent" />
    </div>
  )
}
