'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface PaymentVerificationProps {
  enrollmentId: string
  adminId: string
}

export default function PaymentVerification({ enrollmentId, adminId }: PaymentVerificationProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (status: 'verified' | 'rejected') => {
    if (!confirm(`Apakah Anda yakin ingin ${status === 'verified' ? 'memverifikasi' : 'menolak'} pembayaran ini?`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          payment_status: status,
          verified_by: adminId,
          verified_at: new Date().toISOString(),
        })
        .eq('id', enrollmentId)

      if (updateError) throw updateError

      router.refresh()
      alert(`Pembayaran berhasil ${status === 'verified' ? 'diverifikasi' : 'ditolak'}`)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
      alert('Terjadi kesalahan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => handleVerify('verified')}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {loading ? '...' : 'Verifikasi'}
        </button>
        <button
          onClick={() => handleVerify('rejected')}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {loading ? '...' : 'Tolak'}
        </button>
      </div>
    </div>
  )
}
