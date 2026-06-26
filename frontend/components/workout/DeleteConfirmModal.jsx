/**
 * DeleteConfirmModal.jsx — Confirmation dialog for workout deletion
 */
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, loading, workoutName }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto"
        >
          <AlertTriangle size={24} className="text-red-400" />
        </motion.div>

        <div>
          <h3 className="text-lg font-semibold text-white">Delete Workout?</h3>
          <p className="text-sm text-slate-400 mt-1">
            Are you sure you want to delete{' '}
            <span className="text-white font-medium">{workoutName}</span>?
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
