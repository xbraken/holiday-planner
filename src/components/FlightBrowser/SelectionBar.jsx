import { motion } from 'framer-motion';
import { ArrowRight, Check, Plane } from 'lucide-react';
import { cs } from '../../utils/currency';

export default function SelectionBar({
  step,
  selectedOutbound,
  selectedReturn,
  currency,
  onNextStep,
  onConfirm,
  onBack,
}) {
  const sym = cs(currency);

  if (step === 'outbound' && selectedOutbound) {
    return (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Selected outbound</p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {selectedOutbound.mainAirline} {selectedOutbound.departureTime}
              <ArrowRight className="w-3 h-3 inline mx-1 text-gray-400" />
              {selectedOutbound.arrivalTime}
              <span className="text-green-600 ml-2">{sym}{selectedOutbound.price}</span>
            </p>
          </div>
          <button
            onClick={onNextStep}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            <Plane className="w-4 h-4 rotate-180" />
            Choose Return
          </button>
        </div>
      </motion.div>
    );
  }

  if (step === 'return' && selectedReturn) {
    const total = (selectedOutbound?.price || 0) + selectedReturn.price;
    return (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom"
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Round trip total</p>
              <p className="text-lg font-bold text-green-600">{sym}{total} <span className="text-xs font-normal text-gray-400">per person</span></p>
            </div>
            <button
              onClick={onConfirm}
              className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 active:bg-green-800 transition-colors"
            >
              <Check className="w-4 h-4" />
              Confirm
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
