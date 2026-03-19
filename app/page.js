'use client'
import dynamic from 'next/dynamic'

const OACIntel = dynamic(() => import('../components/OACIntel'), { ssr: false })

export default function Home() {
  return <OACIntel />
}
