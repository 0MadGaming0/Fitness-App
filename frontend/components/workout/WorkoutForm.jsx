/**
 * WorkoutForm.jsx — Add / Edit workout modal form
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dumbbell } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const EXERCISE_SUGGESTIONS = [
  'Bench Press', 'Squat', 'Deadlift', 'Pull-Up', 'Push-Up',
  'Shoulder Press', 'Barbell Row', 'Leg Press', 'Bicep Curl',
  'Tricep Dip', 'Plank', 'Running', 'Cycling', 'Lat Pulldown',
];

export default function WorkoutForm({ isOpen, onClose, onSubmit, editData, loading }) {
  const isEditing = !!editData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { exercise: '', sets: '', reps: '' },
  });

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      reset({ exercise: editData.exercise, sets: editData.sets, reps: editData.reps });
    } else {
      reset({ exercise: '', sets: '', reps: '' });
    }
  }, [editData, reset]);

  const onFormSubmit = (data) => {
    onSubmit({
      exercise: data.exercise.trim(),
      sets: parseInt(data.sets, 10),
      reps: parseInt(data.reps, 10),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Workout' : 'Add Workout'}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Exercise name */}
        <div>
          <Input
            label="Exercise"
            placeholder="e.g. Bench Press"
            icon={<Dumbbell size={15} />}
            error={errors.exercise?.message}
            required
            {...register('exercise', {
              required: 'Exercise name is required',
              minLength: { value: 2, message: 'Too short' },
            })}
          />
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {EXERCISE_SUGGESTIONS.slice(0, 6).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => reset((prev) => ({ ...prev, exercise: s }))}
                className="text-[10px] px-2 py-1 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/20 hover:bg-violet-600/20 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Sets & Reps */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Sets"
            type="number"
            placeholder="3"
            error={errors.sets?.message}
            required
            {...register('sets', {
              required: 'Required',
              min: { value: 1, message: 'Min 1' },
              max: { value: 100, message: 'Max 100' },
            })}
          />
          <Input
            label="Reps"
            type="number"
            placeholder="10"
            error={errors.reps?.message}
            required
            {...register('reps', {
              required: 'Required',
              min: { value: 1, message: 'Min 1' },
              max: { value: 1000, message: 'Max 1000' },
            })}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" fullWidth type="submit" loading={loading}>
            {isEditing ? 'Update' : 'Add Workout'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
