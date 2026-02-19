'use client'

import type { CashFund } from '@/lib/types/database'
import { FUOD_LABELS } from '@/lib/constants'
import { formatCents, progressPercent } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { DollarSign, PartyPopper } from 'lucide-react'

interface FundCardProps {
  fund: CashFund
  isOwner: boolean
}

export function FundCard({ fund, isOwner }: FundCardProps) {
  const isFulfilled = fund.raised_cents >= fund.goal_cents

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow border-l-4 ${
      isFulfilled ? 'border-l-green-500' : 'border-l-rose-500'
    }`}>
      <CardContent className="p-4">
        {/* Header with Icon and Title */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-lg ${
            isFulfilled ? 'bg-green-100' : 'bg-rose-100'
          }`}>
            {isFulfilled ? (
              <PartyPopper className={`w-6 h-6 ${
                isFulfilled ? 'text-green-600' : 'text-rose-600'
              }`} />
            ) : (
              <DollarSign className={`w-6 h-6 ${
                isFulfilled ? 'text-green-600' : 'text-rose-600'
              }`} />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{fund.title}</h3>
            {fund.description && (
              <p className="text-sm text-gray-600 mt-1">{fund.description}</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <ProgressBar
            value={progressPercent(fund.raised_cents, fund.goal_cents)}
            color={isFulfilled ? 'green' : 'rose'}
          />
        </div>

        {/* Funding Status */}
        <p className="text-sm text-gray-600 mb-4">
          {formatCents(fund.raised_cents)} raised of {formatCents(fund.goal_cents)} goal
        </p>

        {/* Celebration State */}
        {isFulfilled && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-green-600" />
            <p className="text-sm font-semibold text-green-700">Fully Funded!</p>
          </div>
        )}

        {/* Action */}
        {!isOwner && (
          <Button
            className="w-full bg-rose-600 hover:bg-rose-700"
            size="sm"
          >
            Contribute
          </Button>
        )}

        {isOwner && (
          <p className="text-xs text-gray-500 italic">
            Manage this fund in your registry settings
          </p>
        )}
      </CardContent>
    </Card>
  )
}
