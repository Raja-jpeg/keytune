'use client'

import { Shield, Check, X } from 'lucide-react'

interface PremiumAccessModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  price: string
}

export default function PremiumAccessModal({
  isOpen,
  onClose,
  onConfirm,
  price
}: PremiumAccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 max-w-md w-full border border-white/20">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-yellow-400" />
            <h3 className="text-xl font-bold">Premium Access</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-300">
            Get full access to this premium track including:
          </p>
          
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>High-quality download</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>No watermarks</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Extended access</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-white/10">
            <p className="text-2xl font-bold text-center">{price}</p>
            <p className="text-xs text-gray-400 text-center">One-time payment</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg font-semibold transition-all"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  )
}